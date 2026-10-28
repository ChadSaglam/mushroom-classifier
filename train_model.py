import json
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent
FEATURES = [
    "odor",
    "spore-print-color",
    "gill-size",
    "bruises",
    "habitat",
    "ring-type",
]


def export_tree(tree):
    state = tree.tree_
    nodes = []
    for index in range(state.node_count):
        values = state.value[index][0]
        nodes.append(
            {
                "feature": int(state.feature[index]),
                "threshold": float(state.threshold[index]),
                "left": int(state.children_left[index]),
                "right": int(state.children_right[index]),
                "value": [float(value) for value in values],
            }
        )
    return nodes


def main():
    data = pd.read_csv(ROOT / "mushrooms.csv")
    X = pd.get_dummies(data[FEATURES])
    y = data["class"] == "p"
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.3,
        random_state=0,
        stratify=y,
    )
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=0,
    ).fit(X_train, y_train)

    predictions = model.predict(X_test)
    tn, fp, fn, tp = confusion_matrix(y_test, predictions).ravel()
    metrics = {
        "test_rows": int(len(y_test)),
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "tp": int(tp),
        "accuracy": float((tp + tn) / len(y_test)),
        "poisonous_recall": float(tp / (tp + fn)),
        "model": "RandomForestClassifier",
        "trees": 100,
        "max_depth": 10,
        "features": FEATURES,
        "test_split": 0.3,
        "random_state": 0,
    }
    exported = {
        "feature_columns": X.columns.tolist(),
        "classes": [bool(value) for value in model.classes_],
        "trees": [export_tree(tree) for tree in model.estimators_],
    }

    (ROOT / "model.json").write_text(json.dumps(exported, separators=(",", ":")), encoding="utf-8")
    (ROOT / "metrics.json").write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    print(f"Exported {len(exported['trees'])} trees with {len(X.columns)} feature columns")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Poisonous recall: {metrics['poisonous_recall']:.4f}")
    print(f"Confusion matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")


if __name__ == "__main__":
    main()
