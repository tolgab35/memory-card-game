const GRID = document.querySelector(".grid-container");
const SCORE_EL = document.getElementById("score");
const TURNS_EL = document.getElementById("turns");
const RESTART_BTN = document.getElementById("restart");

let deck = [];
let first = null,
  second = null;
let lock = false;
let score = 0;
let turns = 0;

async function loadData() {
  const res = await fetch("data/cards.json");
  const all = await res.json();

  shuffle(all);
  const chosen = all.slice(0, 9);

  // preload
  chosen.forEach((c) => {
    const im = new Image();
    im.src = c.image;
  });

  deck = shuffle(
    chosen.flatMap((c) => [
      { ...c, uid: c.id + "-A" },
      { ...c, uid: c.id + "-B" },
    ])
  );
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resetState() {
  first = second = null;
  lock = false;
  score = 0;
  SCORE_EL.textContent = score;
  turns = 0;
  TURNS_EL.textContent = turns;
}

function renderGrid() {
  GRID.innerHTML = "";
  deck.forEach((card) => {
    const el = document.createElement("button");
    el.className = "card";
    el.type = "button";
    el.setAttribute("data-id", card.id);
    el.setAttribute("data-name", card.name);

    // iç yapı: card-inner + iki yüz
    const inner = document.createElement("div");
    inner.className = "card-inner";

    const back = document.createElement("div");
    back.className = "card-face card-back";

    const front = document.createElement("div");
    front.className = "card-face card-front";
    // görseli CSS değişkeniyle front yüzüne taşı
    front.style.setProperty("--img", `url(${card.image})`);

    inner.append(back, front);
    el.appendChild(inner);

    el.addEventListener("click", () => onFlip(el));
    GRID.appendChild(el);
  });
}

function onFlip(el) {
  if (lock) return;
  if (el.classList.contains("matched")) return;
  if (el === first) return;

  el.classList.add("flipped");

  if (!first) {
    first = el;
    return;
  }

  second = el;
  lock = true;

  const match = first.dataset.id === second.dataset.id;

  if (match) {
    first.classList.add("matched");
    second.classList.add("matched");
    first = second = null;
    lock = false;
    SCORE_EL.textContent = ++score;
    TURNS_EL.textContent = ++turns;

    if (document.querySelectorAll(".card.matched").length === deck.length) {
      setTimeout(
        () =>
          alert(`Congratulations! You finished the game with ${turns} moves.`),
        400
      );
    }
  } else {
    setTimeout(() => {
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      first = second = null;
      lock = false;
      TURNS_EL.textContent = ++turns;
    }, 650);
  }
}

async function startGame() {
  resetState();
  await loadData();
  renderGrid();
}

RESTART_BTN.addEventListener("click", startGame);
startGame();
