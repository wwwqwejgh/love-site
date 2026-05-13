const CONFIG = {
  names: ["小凡", "小拉"],
  firstMeet: "2014-01-01",
  firstMeetDisplay: "2014年",
  loveDate: "2023-07-02",
  timeline: [
    {
      date: "2014",
      title: "第一次认真记住彼此",
      text: "那天之后，很多普通瞬间都开始有了特别的意义。",
    },
    {
      date: "2023.07.02",
      title: "正式在一起",
      text: "从这一天开始，我们有了一个共同的名字：我们。",
    },
    {
      date: "2024.02.14",
      title: "第一份情人节记忆",
      text: "礼物会被收起来，但被认真爱着的感觉会留很久。",
    },
    {
      date: "2026.05.13",
      title: "建好这个小站",
      text: "以后把照片、旅行、电影票和深夜聊天都慢慢放进来。",
    },
  ],
  defaultNotes: [
    "想把所有好天气都分你一半。",
    "你出现以后，生活变得更像生活。",
    "下次见面，要抱久一点。",
  ],
  defaultGallery: [
    { caption: "第一张合照的位置" },
    { caption: "一起吃过的好吃的" },
    { caption: "想再去一次的地方" },
    { caption: "某个舍不得删的瞬间" },
  ],
};

const $ = (selector) => document.querySelector(selector);
const storage = {
  photos: "love-site-photos",
  notes: "love-site-notes",
  theme: "love-site-theme",
};

function parseDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function formatDate(dateString) {
  const date = parseDate(dateString);
  return date
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replaceAll("/", ".");
}

function dayDiff(from, to = new Date()) {
  const start = parseDate(from);
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.floor((end - start) / 86400000) + 1);
}

function getNextAnniversary() {
  const today = new Date();
  const love = parseDate(CONFIG.loveDate);
  let next = new Date(today.getFullYear(), love.getMonth(), love.getDate());
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next = new Date(today.getFullYear() + 1, love.getMonth(), love.getDate());
  }
  const days = Math.ceil((next - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
  return days === 0 ? "就是今天" : `${days} 天后`;
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function renderBasics() {
  $("#nameA").textContent = CONFIG.names[0];
  $("#nameB").textContent = CONFIG.names[1];
  $("#firstMeetDate").textContent = CONFIG.firstMeetDisplay ?? formatDate(CONFIG.firstMeet);
  $("#loveDate").textContent = formatDate(CONFIG.loveDate);
  $("#daysTogether").textContent = dayDiff(CONFIG.loveDate).toString();
  $("#anniversaryCountdown").textContent = getNextAnniversary();
  $("#currentYear").textContent = new Date().getFullYear().toString();
}

function renderTimeline() {
  $("#timelineList").innerHTML = CONFIG.timeline
    .map(
      (item) => `
        <article class="timeline-item">
          <time class="timeline-date">${item.date}</time>
          <div>
            <h3 class="timeline-title">${item.title}</h3>
            <p class="timeline-text">${item.text}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderGallery() {
  const photos = readJson(storage.photos, []);
  const tiles = photos.length
    ? photos.map(
        (photo) => `
          <figure class="photo-tile">
            <img src="${photo.src}" alt="${photo.caption}" />
            <figcaption class="photo-caption">${photo.caption}</figcaption>
          </figure>
        `,
      )
    : CONFIG.defaultGallery.map(
        (item) => `
          <figure class="photo-tile">
            <div class="photo-placeholder">${item.caption}<br />点击“添加照片”替换</div>
          </figure>
        `,
      );

  $("#galleryGrid").innerHTML = tiles.join("");
}

function renderNotes() {
  const notes = readJson(
    storage.notes,
    CONFIG.defaultNotes.map((text) => ({
      text,
      date: "默认便签",
    })),
  );

  $("#notesList").innerHTML = notes
    .map(
      (note) => `
        <article class="note">
          <p>${note.text}</p>
          <time>${note.date}</time>
        </article>
      `,
    )
    .join("");
}

function handlePhotoUpload(event) {
  const files = [...event.target.files].slice(0, 12);
  if (!files.length) return;

  Promise.all(
    files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              src: reader.result,
              caption: file.name.replace(/\.[^.]+$/, "") || "我们的照片",
            });
          reader.readAsDataURL(file);
        }),
    ),
  ).then((newPhotos) => {
    const oldPhotos = readJson(storage.photos, []);
    writeJson(storage.photos, [...newPhotos, ...oldPhotos].slice(0, 16));
    renderGallery();
    event.target.value = "";
  });
}

function handleAddNote() {
  const input = $("#noteInput");
  const text = input.value.trim();
  if (!text) return;
  const notes = readJson(storage.notes, []);
  notes.unshift({
    text,
    date: new Date().toLocaleDateString("zh-CN").replaceAll("/", "."),
  });
  writeJson(storage.notes, notes.slice(0, 9));
  input.value = "";
  renderNotes();
}

function setupTheme() {
  const saved = localStorage.getItem(storage.theme);
  if (saved === "night") document.documentElement.dataset.theme = "night";
  $("#themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "night" ? "day" : "night";
    document.documentElement.dataset.theme = next === "night" ? "night" : "";
    localStorage.setItem(storage.theme, next === "night" ? "night" : "day");
  });
}

function setupPetals() {
  const canvas = $("#petalCanvas");
  const context = canvas.getContext("2d");
  const petals = Array.from({ length: 24 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: 4 + Math.random() * 9,
    speed: 0.12 + Math.random() * 0.34,
    drift: Math.random() * 0.7 - 0.35,
    alpha: 0.16 + Math.random() * 0.28,
  }));

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function draw() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    petals.forEach((petal) => {
      const x = petal.x * window.innerWidth;
      const y = petal.y * window.innerHeight;
      context.save();
      context.translate(x, y);
      context.rotate((x + y) * 0.01);
      context.globalAlpha = petal.alpha;
      context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--rose").trim();
      context.beginPath();
      context.ellipse(0, 0, petal.size * 0.55, petal.size, Math.PI / 4, 0, Math.PI * 2);
      context.fill();
      context.restore();

      petal.y += petal.speed / window.innerHeight;
      petal.x += petal.drift / window.innerWidth;
      if (petal.y > 1.08) {
        petal.y = -0.08;
        petal.x = Math.random();
      }
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}

$("#photoInput").addEventListener("change", handlePhotoUpload);
$("#clearPhotos").addEventListener("click", () => {
  localStorage.removeItem(storage.photos);
  renderGallery();
});
$("#addNote").addEventListener("click", handleAddNote);
$("#noteInput").addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    handleAddNote();
  }
});

renderBasics();
renderTimeline();
renderGallery();
renderNotes();
setupTheme();
setupPetals();
