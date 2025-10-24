// === Googleスプレッドシートの設定 ===
const SHEET_ID = "1LjGZ91p4k764671JCVPZz51gjstQ2jec";  // あなたのID
const SHEET_GID = "1282352749";  // 対象タブ（食材-レシピ）のgid
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;

// === データ取得 ===
async function fetchSheetData() {
  const res = await fetch(URL);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  return json.table.rows.map(r => r.c.map(c => (c ? c.v : "")));
}

// === 計算 ===
function calculateIngredients(selectedRecipes, recipeCounts, data) {
  const header = data[0].slice(2, -1); // 食材名部分
  const ingredients = {};

  selectedRecipes.forEach(recipe => {
    const row = data.find(r => r[1] === recipe);
    if (row) {
      row.slice(2, -1).forEach((val, i) => {
        if (val && !isNaN(val)) {
          const ing = header[i];
          ingredients[ing] = (ingredients[ing] || 0) + val * recipeCounts[recipe];
        }
      });
    }
  });
  return ingredients;
}

// === UIロジック ===
document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchSheetData();
  const recipes = data.slice(1).map(r => r[1]);

  const select = document.getElementById("recipeSelect");
  recipes.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });

  document.getElementById("calcBtn").addEventListener("click", () => {
    const selected = Array.from(select.selectedOptions).map(o => o.value);
    const counts = {};
    selected.forEach(r => {
      const input = prompt(`${r} の作成数を入力してください:`);
      counts[r] = parseInt(input) || 0;
    });

    const result = calculateIngredients(selected, counts, data);
    const output = document.getElementById("result");
    output.innerHTML = "";

    Object.entries(result)
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => {
        const li = document.createElement("li");
        li.textContent = `${k}: ${v}`;
        output.appendChild(li);
      });
  });
});
