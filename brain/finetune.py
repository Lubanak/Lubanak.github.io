"""
PHASE 2: fine-tune Pip's brain on its own dataset (contrastive distillation).

The site currently uses the stock MiniLM model. This script teaches it that
questions with the same intent should land close together, and different
intents far apart, then exports a quantized ONNX model that the website can
load instead.

Run it on Google Colab (free GPU: Runtime -> Change runtime type -> T4 GPU):

    !pip install -q sentence-transformers "optimum[onnxruntime]"
    # upload brain/train.json (made by brain/build.html) and this file, then:
    !python finetune.py

Then:
  1. Download the `kanwar-minilm` folder it creates and put it at
     site/brain/models/kanwar-minilm/  (it should contain config.json,
     tokenizer files, and onnx/model_quantized.onnx).
  2. In brain/brain.js set:  const LOCAL_MODEL = "kanwar-minilm";
  3. Rebuild the index with brain/build.html and compare the eval score
     against the stock model (~89%). Keep whichever is better.

NOTE: written against the sentence-transformers / optimum APIs, but not run
in the environment where it was written. If a call has moved in a newer
library version, the error message usually names the replacement.
"""
import json
import os
import random
import shutil

from sentence_transformers import InputExample, SentenceTransformer, losses
from torch.utils.data import DataLoader

BASE = "sentence-transformers/all-MiniLM-L6-v2"  # same model the site uses (Xenova/ is its ONNX copy)
OUT = "kanwar-minilm"
EPOCHS = 4
BATCH = 32
SEED = 42

random.seed(SEED)
data = json.load(open("train.json", encoding="utf-8"))

# Positive pairs: two different examples from the same intent.
# MultipleNegativesRankingLoss treats every other pair in the batch as a negative,
# so it learns "same intent = close, different intent = far" without hand-made negatives.
pairs = []
for it in data["intents"]:
    ex = [e.lower() for e in it["examples"]]
    for i, a in enumerate(ex):
        for b in random.sample(ex, min(4, len(ex))):
            if a != b:
                pairs.append(InputExample(texts=[a, b]))
random.shuffle(pairs)
print(f"{len(data['intents'])} intents -> {len(pairs)} training pairs")

model = SentenceTransformer(BASE)
loader = DataLoader(pairs, shuffle=True, batch_size=BATCH)
loss = losses.MultipleNegativesRankingLoss(model)
model.fit(train_objectives=[(loader, loss)], epochs=EPOCHS, warmup_steps=int(0.1 * len(loader) * EPOCHS), show_progress_bar=True)

tmp = OUT + "-pytorch"
model.save(tmp)

# ---- export to ONNX + 8-bit quantize, in the folder layout transformers.js expects ----
from optimum.onnxruntime import ORTModelForFeatureExtraction, ORTQuantizer
from optimum.onnxruntime.configuration import AutoQuantizationConfig

if os.path.exists(OUT):
    shutil.rmtree(OUT)
ort = ORTModelForFeatureExtraction.from_pretrained(tmp, export=True)
ort.save_pretrained(OUT)
model.tokenizer.save_pretrained(OUT)

quantizer = ORTQuantizer.from_pretrained(OUT)
qconfig = AutoQuantizationConfig.avx512_vnni(is_static=False, per_channel=False)
quantizer.quantize(save_dir=os.path.join(OUT, "onnx_q"), quantization_config=qconfig)

os.makedirs(os.path.join(OUT, "onnx"), exist_ok=True)
shutil.move(os.path.join(OUT, "model.onnx"), os.path.join(OUT, "onnx", "model.onnx"))
qfile = [f for f in os.listdir(os.path.join(OUT, "onnx_q")) if f.endswith(".onnx")][0]
shutil.move(os.path.join(OUT, "onnx_q", qfile), os.path.join(OUT, "onnx", "model_quantized.onnx"))
shutil.rmtree(os.path.join(OUT, "onnx_q"))

print(f"\nDone. Put the '{OUT}' folder in site/brain/models/ and set LOCAL_MODEL in brain/brain.js.")
for root, _, files in os.walk(OUT):
    for f in files:
        p = os.path.join(root, f)
        print(f"  {p}  {os.path.getsize(p) / 1e6:.1f} MB")
