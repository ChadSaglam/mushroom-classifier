const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    for (const item of tabs) {
      const selected = item === tab;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", String(selected));
    }
    for (const panel of panels) {
      panel.hidden = panel.id !== `panel-${tab.dataset.panel}`;
    }
  });
}

let model;

function predict(choices) {
  const input = Object.fromEntries(model.feature_columns.map((column) => [column, 0]));
  for (const [feature, value] of Object.entries(choices)) {
    const column = `${feature}_${value}`;
    if (!(column in input)) throw new Error(`Unknown feature value: ${column}`);
    input[column] = 1;
  }

  const poisonousIndex = model.classes.indexOf(true);
  let total = 0;
  for (const nodes of model.trees) {
    let node = nodes[0];
    while (node.left !== -1) {
      const value = input[model.feature_columns[node.feature]];
      node = nodes[value <= node.threshold ? node.left : node.right];
    }
    total += node.value[poisonousIndex];
  }
  return total / model.trees.length;
}

function showResult(score) {
  const result = document.querySelector("#result");
  const title = document.querySelector("#result-title");
  const copy = document.querySelector("#result-copy");
  result.className = "result";

  if (score >= 0.5) {
    result.classList.add("danger");
    document.querySelector("#result-label").textContent = "Poisonous class match";
    title.textContent = "Do not eat it.";
    copy.textContent = "This description matches the poisonous class in the training data. A real identification requires a qualified expert.";
  } else if (score >= 0.02) {
    result.classList.add("unclear");
    document.querySelector("#result-label").textContent = "Unclear result";
    title.textContent = "Treat the result as unsafe.";
    copy.textContent = "The model does not give a clear class match. Do not use this output to make a food-safety decision.";
  } else {
    result.classList.add("dataset-match");
    document.querySelector("#result-label").textContent = "Edible class match in this dataset";
    title.textContent = "This is not a safety clearance.";
    copy.textContent = "The model can classify poisonous records as edible, and your description may not match the real mushroom. Do not eat it based on this result.";
  }

  document.querySelector("#result-score").textContent = `Random Forest score for the poisonous class: ${(score * 100).toFixed(1)}%. This is not a calibrated probability of poisoning.`;
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.querySelector("#mushroom-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!model) return;
  const choices = Object.fromEntries(new FormData(event.currentTarget).entries());
  showResult(predict(choices));
});

function setText(selector, value) {
  document.querySelector(selector).textContent = value;
}

async function load() {
  try {
    const [modelResponse, metricsResponse] = await Promise.all([
      fetch("./model.json"),
      fetch("./metrics.json"),
    ]);
    if (!modelResponse.ok || !metricsResponse.ok) throw new Error("Model files unavailable");
    model = await modelResponse.json();
    const metrics = await metricsResponse.json();

    setText("#metric-rows", metrics.test_rows.toLocaleString("en-US"));
    setText("#metric-accuracy", `${(metrics.accuracy * 100).toFixed(2)}%`);
    setText("#metric-recall", `${(metrics.poisonous_recall * 100).toFixed(2)}%`);
    setText("#metric-fn", metrics.fn);
    setText("#cm-tn", metrics.tn.toLocaleString("en-US"));
    setText("#cm-fp", metrics.fp.toLocaleString("en-US"));
    setText("#cm-fn", metrics.fn.toLocaleString("en-US"));
    setText("#cm-tp", metrics.tp.toLocaleString("en-US"));
    setText("#model-status", "Model ready · runs locally in your browser");
    document.querySelector("#predict-button").disabled = false;
  } catch (error) {
    setText("#model-status", "The model could not be loaded. Reload the page to try again.");
    console.error(error);
  }
}

load();
