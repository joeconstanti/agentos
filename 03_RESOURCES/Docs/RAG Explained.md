---
id: 20260406090700
type: note
status: draft
created: 2026-04-06 09:07
tags:
  - docs
  - guides
  - rag
  - ai
  - vector-search
  - embeddings
area: docs
---
# RAG (Retrieval-Augmented Generation) Explained

RAG is the technique of giving a language model access to a searchable knowledge base at inference time, rather than baking that knowledge into the model's weights through training. The model retrieves relevant passages, adds them to the prompt as context, and generates a response grounded in that evidence.

It sounds simple, and the basic version is. But getting RAG to work well — high recall, low hallucination, good latency, reasonable cost — requires careful decisions at every step of the pipeline.

![[rag-pipeline.svg]]

## The core idea

LLMs have a knowledge cutoff. They don't know about your private documents, your internal wiki, or events after training. RAG solves this without retraining:

1. **Index time**: split your documents into chunks, embed each chunk as a vector, store vectors in a vector database
2. **Query time**: embed the user's question as a vector, find the most similar chunks by cosine similarity, inject them into the prompt as context

The model then answers using the retrieved context, not just its parametric memory. Crucially, it can cite which source it drew from.

## Step 1: Indexing

### Loading documents

RAG can ingest almost any text: PDFs, Markdown files, web pages, database rows, code, emails. Libraries like LangChain, LlamaIndex, and Unstructured handle common formats.

```python
from langchain.document_loaders import DirectoryLoader, TextLoader

loader = DirectoryLoader("./docs", glob="**/*.md", loader_cls=TextLoader)
documents = loader.load()
```

### Chunking

Chunking is one of the highest-impact decisions in RAG. Too small: chunks lack context and return poor results. Too large: you include irrelevant text in the prompt and hit context limits.

Common strategies:

| Strategy | When to use |
|----------|-------------|
| **Fixed size** (512 tokens, 100 overlap) | General purpose; good starting point |
| **Recursive character** | Tries to split on paragraph, then sentence, then word — preserves semantic units |
| **Semantic chunking** | Split where the topic changes, using an embedding model to detect shifts |
| **Document-aware** | Split on headings (for Markdown/HTML); keeps sections intact |

The overlap (typically 10–20% of chunk size) ensures that concepts at chunk boundaries don't get split across two context-less fragments.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
chunks = splitter.split_documents(documents)
```

### Embedding

An embedding model converts a chunk of text into a dense vector (typically 768–3072 floats). Semantically similar texts produce similar vectors — this is what makes semantic search possible.

**Cloud embedding models:**
- `text-embedding-3-small` / `text-embedding-3-large` (OpenAI) — strong general-purpose
- `voyage-3` (Voyage AI) — excellent for retrieval tasks

**Local embedding models (via [[Getting Started with Ollama]]):**
- `nomic-embed-text` — fast, good quality, ~300MB
- `mxbai-embed-large` — higher quality, ~700MB

All embedding and retrieval must use the same model — vectors from different models are incompatible.

```python
from langchain.embeddings import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
```

## Step 2: Vector stores

A vector store indexes your embeddings and makes similarity search fast at scale.

| Store | Hosting | Best for |
|-------|---------|---------|
| **Chroma** | Local or server | Local dev, small-medium corpora |
| **pgvector** | Self-hosted Postgres extension | Already using Postgres; SQL + vector in one |
| **Pinecone** | Cloud (managed) | Production at scale; fully managed |
| **Weaviate** | Self-hosted or cloud | Multi-modal; hybrid search built-in |
| **Qdrant** | Self-hosted or cloud | High performance; Rust-native |
| **Supabase** | Cloud (Postgres + pgvector) | If already using Supabase |

For local development with Ollama embeddings, Chroma is the simplest option:

```python
from langchain.vectorstores import Chroma

# Build the vector store from chunks
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

# Later: reload without reindexing
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)
```

## Step 3: Retrieval

At query time, embed the user's question and find the nearest chunks.

### Basic similarity search (top-K)

```python
query = "How do I configure MCP servers in Claude Code?"
results = vectorstore.similarity_search(query, k=5)

# Results are Document objects with .page_content and .metadata
for doc in results:
    print(doc.page_content)
    print(doc.metadata["source"])
```

### MMR (Maximum Marginal Relevance)

Standard top-K can return near-duplicate chunks. MMR balances relevance with diversity, returning results that cover more of the answer space:

```python
results = vectorstore.max_marginal_relevance_search(query, k=5, fetch_k=20)
```

### Hybrid search

Combining semantic (vector) search with keyword (BM25) search often beats either alone, especially for queries that include specific names, IDs, or technical terms:

```python
# Many vector stores support hybrid search natively
results = vectorstore.hybrid_search(query, k=5, alpha=0.5)
# alpha=0 → pure keyword; alpha=1 → pure semantic
```

### Re-ranking

After retrieving top-K candidates, a cross-encoder re-ranking model re-scores them with higher accuracy (but higher latency). Good for production systems where precision matters:

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
scores = reranker.predict([(query, doc.page_content) for doc in results])
ranked = sorted(zip(scores, results), key=lambda x: x[0], reverse=True)
```

## Step 4: Generation

Inject the retrieved context into the prompt and call the LLM:

```python
from langchain.chat_models import ChatAnthropic
from langchain.chains import RetrievalQA

llm = ChatAnthropic(model="claude-sonnet-4-6")
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
)

result = qa_chain.invoke({"query": "How does MCP work?"})
print(result["result"])
print("Sources:", [doc.metadata["source"] for doc in result["source_documents"]])
```

## RAG vs the alternatives

| Approach | When to use |
|----------|------------|
| **RAG** | Large, frequently-updated knowledge bases; private data; need to cite sources |
| **Fine-tuning** | Specific behaviour or style; structured output formats; domain jargon the base model doesn't know |
| **Long context** | Small-to-medium corpora that fit in one prompt; simplicity matters more than cost |
| **Parametric knowledge** | Stable, well-known information; no retrieval latency acceptable |

RAG and long context are increasingly complementary: use RAG to find the right chunks, then pass them in a long-context window for richer reasoning.

## Common failure modes

**Bad chunking** — the answer is split across two chunks that are retrieved separately and lack context. Fix: increase overlap, use semantic chunking, or use parent-document retrieval.

**Embedding mismatch** — using a general embedding model for a specialised domain. Fix: fine-tune the embedding model or use a domain-specific one.

**Low recall** — the right chunk isn't in the top-K. Fix: increase K, use MMR, add re-ranking, or use hybrid search.

**Context stuffing** — passing too many chunks inflates the prompt and confuses the model. Fix: use re-ranking, reduce K, or summarise chunks before injecting.

**Hallucination despite retrieval** — model ignores the context and makes things up. Fix: add explicit instructions ("answer only using the provided context; if unsure, say so") and use a model with strong instruction following.

---

## Related notes

- [[Getting Started with Ollama]] — local embedding models and inference for offline RAG
- [[Multi-Agent Orchestration]] — combining RAG with multi-agent workflows
- [[Getting Started with MCP]] — exposing a RAG pipeline as an MCP tool
