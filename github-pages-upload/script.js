const SUPABASE_CONFIG = {
  url: "https://snzhrognrosbmeywujev.supabase.co/rest/v1/",
  anonKey: "sb_publishable_vNat6eXTH-sw2buiExlkew_Ptyyat7L",
  photoBucket: "love-photos",
};

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

const cloudEnabled =
  typeof window.supabase !== "undefined" &&
  SUPABASE_CONFIG.url.startsWith("https://") &&
  SUPABASE_CONFIG.anonKey.length > 40 &&
  !SUPABASE_CONFIG.url.includes("PASTE_") &&
  !SUPABASE_CONFIG.anonKey.includes("PASTE_");

const cloud = cloudEnabled
  ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;

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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setSyncStatus(message, type = "muted") {
  const target = $("#syncStatus");
  if (!target) return;
  target.textContent = message;
  target.dataset.type = type;
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
          <time class="timeline-date">${escapeHtml(item.date)}</time>
          <div>
            <h3 class="timeline-title">${escapeHtml(item.title)}</h3>
            <p class="timeline-text">${escapeHtml(item.text)}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderGallery(photos = getLocalPhotos()) {
  const tiles = photos.length
    ? photos.map(
        (photo) => `
          <figure class="photo-tile">
            <img src="${escapeHtml(photo.image_url || photo.src)}" alt="${escapeHtml(photo.caption)}" />
            <figcaption class="photo-caption">${escapeHtml(photo.caption)}</figcaption>
          </figure>
        `,
      )
    : CONFIG.defaultGallery.map(
        (item) => `
          <figure class="photo-tile">
            <div class="photo-placeholder">${escapeHtml(item.caption)}<br />点击“添加照片”替换</div>
          </figure>
        `,
      );

  $("#galleryGrid").innerHTML = tiles.join("");
}

function renderNotes(notes = getLocalNotes()) {
  $("#notesList").innerHTML = notes
    .map(
      (note) => `
        <article class="note">
          <p>${escapeHtml(note.text)}</p>
          <time>${escapeHtml(note.date || formatDisplayDate(note.created_at))}</time>
        </article>
      `,
    )
    .join("");
}

function getLocalPhotos() {
  return readJson(storage.photos, []);
}

function getLocalNotes() {
  return readJson(
    storage.notes,
    CONFIG.defaultNotes.map((text) => ({
      text,
      date: "默认便签",
    })),
  );
}

function formatDisplayDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("zh-CN").replaceAll("/", ".");
}

async function loadCloudData() {
  $("#clearPhotos").hidden = Boolean(cloud);

  if (!cloud) {
    setSyncStatus("当前是本地模式：照片和留言只保存在这台设备。配置 Supabase 后会自动云同步。");
    renderGallery();
    renderNotes();
    return;
  }

  setSyncStatus("正在同步云端照片和留言...");

  try {
    const [{ data: photos, error: photoError }, { data: notes, error: noteError }] = await Promise.all([
      cloud.from("love_photos").select("id, image_url, caption, created_at").order("created_at", { ascending: false }),
      cloud.from("love_notes").select("id, text, created_at").order("created_at", { ascending: false }),
    ]);

    if (photoError) throw photoError;
    if (noteError) throw noteError;

    renderGallery(photos ?? []);
    renderNotes(notes ?? []);
    setSyncStatus("云同步已开启：你们在不同设备上传的照片和留言都会显示在这里。", "ok");
  } catch (error) {
    console.error(error);
    setSyncStatus("云同步失败：请检查 Supabase URL、anon key、建表 SQL 和 Storage policy。", "error");
    renderGallery();
    renderNotes();
  }
}

function safeFileName(name) {
  const extension = name.includes(".") ? name.split(".").pop().toLowerCase() : "jpg";
  return `${Date.now()}-${crypto.randomUUID()}.${extension.replace(/[^a-z0-9]/g, "") || "jpg"}`;
}

async function uploadCloudPhoto(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} 不是图片文件`);
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error(`${file.name} 超过 8MB，请先压缩后再上传`);
  }

  const path = safeFileName(file.name);
  const { error: uploadError } = await cloud.storage
    .from(SUPABASE_CONFIG.photoBucket)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = cloud.storage.from(SUPABASE_CONFIG.photoBucket).getPublicUrl(path);
  const caption = file.name.replace(/\.[^.]+$/, "") || "我们的照片";
  const { error: insertError } = await cloud.from("love_photos").insert({
    image_url: data.publicUrl,
    storage_path: path,
    caption,
  });

  if (insertError) throw insertError;
}

async function handlePhotoUpload(event) {
  const files = [...event.target.files].slice(0, 12);
  if (!files.length) return;

  if (cloud) {
    setSyncStatus("正在上传照片到云端...");
    try {
      for (const file of files) {
        await uploadCloudPhoto(file);
      }
      await loadCloudData();
    } catch (error) {
      console.error(error);
      setSyncStatus(error.message || "照片上传失败，请检查 Supabase Storage 权限。", "error");
    } finally {
      event.target.value = "";
    }
    return;
  }

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
    const oldPhotos = getLocalPhotos();
    writeJson(storage.photos, [...newPhotos, ...oldPhotos].slice(0, 16));
    renderGallery();
    event.target.value = "";
  });
}

async function handleAddNote() {
  const input = $("#noteInput");
  const text = input.value.trim();
  if (!text) return;

  if (cloud) {
    try {
      const { error } = await cloud.from("love_notes").insert({ text });
      if (error) throw error;
      input.value = "";
      await loadCloudData();
    } catch (error) {
      console.error(error);
      setSyncStatus("便签保存失败，请检查 love_notes 表权限。", "error");
    }
    return;
  }

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
loadCloudData();
setupTheme();
setupPetals();
