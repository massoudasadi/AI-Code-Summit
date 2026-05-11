import huggingface_hub

models = [
    "onnx-community/embeddinggemma-300m-ONNX",
    "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
    "Xenova/whisper-tiny.en",
    "Xenova/mms-tts-eng",
    "Xenova/vit-gpt2-image-captioning",
    "Xenova/m2m100_418M",
    "onnx-community/gemma-3-270m-it-ONNX",
    "onnx-community/gemma-3-1b-it-ONNX",
]

for model in models:
    print(f"\n{'='*60}")
    print(f"Downloading: {model}")
    print(f"{'='*60}")
    huggingface_hub.snapshot_download(
        repo_id=model,
        local_dir=f"models/{model}"
    )
    print(f"Done: {model}")

print("\nAll models downloaded successfully!")
