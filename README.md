---
title: Mushroom Classifier
emoji: 🍄
colorFrom: green
colorTo: gray
sdk: static
app_file: index.html
pinned: false
license: mit
short_description: Random Forest demo with explicit safety limitations
---

# Mushroom Classifier

A browser-based classification demo using six categorical features from the UCI Mushroom dataset. A Random Forest trained offline is exported to JSON and evaluated locally in the browser, with no Python runtime or uploaded user data.

**Never use this demo to decide whether a mushroom is safe to eat.** The records are hypothetical, the model makes mistakes, and the six inputs are not enough for real identification. In Switzerland, use an [official mushroom inspection service](https://www.vapko.ch/).

## Resources

- [Live demo](https://huggingface.co/spaces/ChadSaglam/mushroom-classifier)
- [Model: scikit-learn RandomForestClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html)
- [Dataset: UCI Mushroom](https://archive.ics.uci.edu/dataset/73/mushroom)
- [Source code](https://github.com/ChadSaglam/mushroom-classifier)

## Model and measured results

The baseline uses 100 trees, a maximum depth of 10, one-hot encoding and six of the 22 dataset features. Training uses a stratified 70/30 split with random state 0.

| Metric | Held-out result |
|---|---:|
| Test rows | 2,438 |
| Accuracy | 99.88% |
| Poisonous recall | 99.74% |
| Poisonous records marked edible | 3 |

Confusion matrix:

| Actual class | Predicted edible | Predicted poisonous |
|---|---:|---:|
| Edible | 1,263 | 0 |
| Poisonous | 3 | 1,172 |

The displayed model score averages tree-level class estimates. It is not a calibrated probability of poisoning. These measurements come from one random split of a small, hypothetical dataset; they do not estimate performance on real mushroom identification.

## Interface

- **Check a description:** six accessible select inputs and a safety-first result.
- **Limitations:** dataset scope, missing traits and false negatives.
- **Model details:** live values from `metrics.json`, confusion matrix and model documentation.
- **Data & credits:** UCI licence, model reference, photo attribution and Swiss inspection link.

The page has no runtime dependencies. `app.js` traverses the 100 exported trees directly, so it does not need Streamlit, Pyodide or a server-side model.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Create a production build with `npm run build`.

## Reproduce the model

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train_model.py
```

This reads `mushrooms.csv` and rewrites `model.json` and `metrics.json`. The current export contains 34 one-hot feature columns and 100 trees.

## Dataset and photograph credits

The [UCI Mushroom dataset](https://archive.ics.uci.edu/dataset/73/mushroom) contains 8,124 hypothetical records and is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). DOI: [10.24432/C5959T](https://doi.org/10.24432/C5959T).

The photograph is [Young Amanita muscaria (fly agaric)](https://commons.wikimedia.org/wiki/File:Young_Amanita_muscaria_(fly_agaric)_-_geograph.org.uk_-_7327975.jpg) by Jay Pea, via Wikimedia Commons, licensed under [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/). The original file is included unchanged. Third-party data and images retain their respective licences.
