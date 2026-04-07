---
id: 20260406090300
type: note
status: draft
created: 2026-04-06 09:03
tags:
  - docs
  - guides
  - ollama
  - local-ai
  - open-source
  - llm
area: docs
---
# Getting Started with Ollama (Local AI)

Ollama is the easiest way to run open-weight language models locally. One command installs a model; another runs it. Under the hood, Ollama handles model downloads, quantization, and hardware acceleration (Apple Silicon MPS, NVIDIA CUDA, AMD ROCm) — you get a local REST API that speaks the OpenAI format.

For an AgentOS workflow, Ollama fills the gap when you need inference without network latency, without API costs, and without sending data to a third party. It's also the natural local backend for RAG pipelines, code tools, and agentic loops that need to run hundreds of calls cheaply.

## Why run models locally?

- **Privacy** — notes, code, internal documents never leave your machine
- **Cost** — no per-token charges; run as many calls as you want
- **Latency** — no round-trip to a remote API; good for tight agent loops
- **Offline** — works on planes, in VPNs, in air-gapped environments
- **Experimentation** — switch models in seconds to compare outputs

The tradeoff: local models are generally less capable than frontier models (Claude Sonnet, GPT-4o) for complex reasoning and long-context tasks. Use Ollama for the tasks where a smaller model is good enough, and route difficult tasks to Claude.

## 1. Install Ollama

### macOS

```bash
brew install ollama
```

Or download the `.dmg` from [ollama.com](https://ollama.com).

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows

Download the installer from [ollama.com/download](https://ollama.com/download).

After installation, Ollama runs as a background service on port `11434`.

## 2. Pull a model

```bash
# General-purpose (good balance of speed and quality on Apple Silicon)
ollama pull llama3.2

# Smaller, very fast — good for simple tasks and embeddings
ollama pull llama3.2:1b

# Code-focused
ollama pull qwen2.5-coder:7b

# Latest Mistral
ollama pull mistral-small3.2

# Embedding model (for RAG)
ollama pull nomic-embed-text

# List what you have
ollama list
```

The model library is at [ollama.com/library](https://ollama.com/library) — 1,000+ models including Llama, Mistral, Qwen, Gemma, Phi, DeepSeek, and more.

## 3. Run inference

```bash
# Interactive chat in the terminal
ollama run llama3.2

# Single prompt, non-interactive
ollama run llama3.2 "Summarise this in three bullet points: ..."

# With a custom system prompt
ollama run llama3.2 --system "You are a concise technical writer."
```

To exit the interactive shell: `/bye`

## 4. Use the REST API

Ollama exposes a local HTTP server on `http://localhost:11434` with two main endpoints.

### Generate (completion)

```bash
curl http://localhost:11434/api/generate \
  -d '{
    "model": "llama3.2",
    "prompt": "Why is the sky blue?",
    "stream": false
  }'
```

### Chat (messages format)

```bash
curl http://localhost:11434/api/chat \
  -d '{
    "model": "llama3.2",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "What is MCP?" }
    ],
    "stream": false
  }'
```

### OpenAI-compatible endpoint

Ollama also speaks the OpenAI API format at `/v1/` — this means you can use any OpenAI SDK or tool with Ollama by just changing the base URL:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",                    # required but ignored
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

## 5. Connect Ollama to Claude Code

Claude Code supports custom model backends. Add Ollama as an alternative model for tasks where a local model is sufficient:

```json
// ~/.claude/claude.json
{
  "customModels": {
    "local-llama": {
      "baseUrl": "http://localhost:11434/v1",
      "apiKey": "ollama",
      "modelId": "llama3.2"
    }
  }
}
```

Then switch in a session: `claude --model local-llama`

## 6. Use Ollama for embeddings (RAG)

Ollama's embedding models generate vectors you can store in a local vector database for RAG workflows — entirely offline:

```python
import requests

def embed(text: str) -> list[float]:
    response = requests.post(
        "http://localhost:11434/api/embeddings",
        json={"model": "nomic-embed-text", "prompt": text}
    )
    return response.json()["embedding"]

# Use with ChromaDB, pgvector, or any vector store
vector = embed("The MCP protocol uses JSON-RPC 2.0")
```

See [[RAG (Retrieval-Augmented Generation) Explained]] for how to build the full pipeline.

## 7. Modelfiles — customise a model

A Modelfile is like a Dockerfile for models. Use it to set a system prompt, adjust parameters, or merge LoRA adapters:

```dockerfile
# Modelfile
FROM llama3.2

SYSTEM """
You are a senior software engineer reviewing code for a TypeScript monorepo.
Be concise. Point out issues and suggest fixes. Do not explain basics.
"""

PARAMETER temperature 0.2
PARAMETER num_ctx 8192
```

```bash
ollama create code-reviewer -f ./Modelfile
ollama run code-reviewer
```

## 8. Run as a service

On macOS, Ollama installs a launch agent that keeps it running in the background. On Linux:

```bash
# Enable as a systemd service
sudo systemctl enable ollama
sudo systemctl start ollama

# Check status
sudo systemctl status ollama
```

## Recommended models by use case

| Use case | Model | Size | Notes |
|----------|-------|------|-------|
| General chat | `llama3.2` | 2–8 GB | Best all-round for 7–8B class |
| Fast / cheap | `llama3.2:1b` | ~1 GB | Good for classification, extraction |
| Code | `qwen2.5-coder:7b` | ~5 GB | Strong code completion |
| Long context | `gemma3:27b` | ~18 GB | 128k context window |
| Embeddings | `nomic-embed-text` | ~300 MB | Fast, good quality |
| Vision | `llava` | ~5 GB | Image + text input |

---

## Related notes

- [[ComfyUI Getting Started]] — another locally-run AI tool for image generation
- [[AI Coding Agent Alternatives]] — how local models fit into the broader agent landscape
- [[RAG (Retrieval-Augmented Generation) Explained]] — building RAG pipelines with Ollama embeddings
