---
id: 20260325090200
type: note
status: draft
created: 2026-03-25 09:02
tags:
  - docs
  - guides
  - ai
  - image-generation
  - comfyui
area: docs
---
# ComfyUI — Getting Started

ComfyUI is an open-source, node-based GUI for AI image (and video) generation. Instead of a single settings panel, you visually wire together a pipeline of nodes — checkpoint loaders, text encoders, samplers, ControlNet, LoRAs, upscalers, and more — giving you full control over how your images are generated.

Think of it like a visual programming tool where each node is a function and the wires between them are data flowing from one step to the next.

## Why ComfyUI?

- **No black box**: you see and control every step of the generation pipeline.
- **Reproducible**: save your workflow as a JSON file and re-run it exactly.
- **Extensible**: 1,000+ custom node packages available (video generation, inpainting, batch tools, etc.).
- **Fast iteration**: swap models, samplers, or LoRAs without restarting.

## System requirements

| Platform | Minimum | Recommended |
|----------|---------|-------------|
| Windows | NVIDIA GPU, 6 GB VRAM | 12–24 GB VRAM |
| Linux | NVIDIA GPU, 6 GB VRAM | 12–24 GB VRAM |
| Mac | Apple Silicon (M1+) | M2/M3/M4, 16 GB+ unified memory |

For **FLUX models** (currently the best open-source quality):
- Mac: Use quantized GGUF versions of FLUX — the fp8/fp16 versions cause MPS errors on macOS.
- 32 GB+ unified memory gives 1–3 minute generation times with full FLUX Dev.
- 16 GB works fine with smaller GGUF quantizations.

## 1) Install ComfyUI

### Option A — ComfyUI Desktop (recommended for beginners)

The desktop app wraps ComfyUI in a native installer with no manual Python setup.

- **Mac (Apple Silicon)**: Download from [comfy.org](https://docs.comfy.org/get_started) — currently in Beta
- **Windows**: Available as a standalone `.exe` installer

### Option B — Manual install (recommended for power users)

Requires Python 3.10+ and Git.

```bash
git clone https://github.com/comfyanonymous/ComfyUI
cd ComfyUI

# Mac (Apple Silicon) — use nightly PyTorch for MPS support
pip install --pre torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/nightly/cpu

# Windows/Linux (NVIDIA)
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu124

pip install -r requirements.txt
python main.py
```

Open `http://127.0.0.1:8188` in your browser.

## 2) Get models

ComfyUI ships with no models — you need to download them separately.

**Where to put models**: `ComfyUI/models/checkpoints/`

**Recommended starting models**:
- **FLUX.1 Schnell** (free, fast, open weights) — great for quick experiments
- **FLUX.1 Dev** (gated license, higher quality) — best quality open model
- **SDXL** (older but well-supported) — huge LoRA/extension ecosystem

Download from [Hugging Face](https://huggingface.co) or [CivitAI](https://civitai.com). For Mac, search for GGUF quantized versions of FLUX.

## 3) Core concepts

**Nodes** are the building blocks. Each node has input slots (left) and output slots (right). Wire them together to form a pipeline.

Key nodes in a basic text-to-image workflow:
- `Load Checkpoint` — loads your model
- `CLIP Text Encode` — encodes your positive and negative prompts
- `KSampler` — runs the diffusion process
- `VAE Decode` — converts latent space output to an image
- `Save Image` — writes the result to disk

**Workflows** are the full connected graph. Save as JSON to reuse and share.

**Custom nodes** extend ComfyUI's capabilities. Install via **ComfyUI Manager** (a custom node that manages other custom nodes).

```bash
# Install ComfyUI Manager
cd ComfyUI/custom_nodes
git clone https://github.com/ltdrdata/ComfyUI-Manager
```

## 4) First image (basic workflow)

1. Open ComfyUI in the browser.
2. Load the default workflow (`Load Default` button, or it appears on startup).
3. In the `Load Checkpoint` node, select your model file.
4. Edit the positive prompt in `CLIP Text Encode (positive)`.
5. Set your resolution and steps in `Empty Latent Image` and `KSampler`.
6. Click **Queue Prompt**.

## 5) Suggested learning path

| Timeframe | Focus |
|-----------|-------|
| Week 1 | Basic text-to-image, understand the default workflow nodes |
| Week 2 | LoRAs, img2img, inpainting |
| Week 3 | ControlNet (pose/depth/canny control), upscaling |
| Month 1 | Video generation with WAN2.1/Mochi, complex multi-model workflows |

## 6) Useful resources

- **Official docs**: [docs.comfy.org](https://docs.comfy.org)
- **ComfyUI Wiki**: [comfyui-wiki.com](https://comfyui-wiki.com)
- **Workflow library**: [openart.ai/workflows](https://openart.ai/workflows) — browse and import community workflows
- **ComfyUI Manager**: install from `custom_nodes` — essential for managing extensions
- **Stable Diffusion Art guide**: [stable-diffusion-art.com/comfyui](https://stable-diffusion-art.com/comfyui) — best written beginner guide

---

## Related

- [[Getting Started with Ollama]] — Running other open-weight models locally
- [[AI Coding Agent Alternatives]] — Broader landscape of local AI tools
- [[RAG Explained]] — Combining image generation with retrieval workflows
