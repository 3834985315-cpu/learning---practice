const form = document.getElementById("uploadForm");
const titleInput = document.getElementById("titleInput");
const descInput = document.getElementById("descInput");
const fileInput = document.getElementById("fileInput");
const gallery = document.getElementById("gallery");
const template = document.getElementById("itemTemplate");
const msg = document.getElementById("msg");

function setMessage(text, isError = false) {
  msg.textContent = text;
  msg.classList.toggle("error", isError);
}

function clearGallery() {
  gallery.innerHTML = "";
}

function addItem({ title, desc, src }) {
  const node = template.content.cloneNode(true);
  const img = node.querySelector("img");
  const h3 = node.querySelector("h3");
  const p = node.querySelector("p");

  img.src = src;
  img.alt = title || "若叶睦美图";
  h3.textContent = title || "未命名投稿";
  p.textContent = desc || "这位投稿者没有留下说明。";

  gallery.prepend(node);
}

async function loadPosts() {
  try {
    const resp = await fetch("/api/posts");
    if (!resp.ok) {
      throw new Error("加载失败");
    }
    const posts = await resp.json();
    clearGallery();
    posts.forEach((post) => addItem(post));
  } catch (err) {
    setMessage("加载公共画廊失败，请稍后重试。", true);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMessage("");

  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const file = fileInput.files?.[0];

  if (!file) {
    setMessage("请先选择一张图片。", true);
    return;
  }

  if (!file.type.startsWith("image/")) {
    setMessage("请选择正确的图片格式文件。", true);
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("desc", desc);
  formData.append("image", file);

  try {
    const resp = await fetch("/api/posts", {
      method: "POST",
      body: formData,
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || "投稿失败");
    }

    addItem(data);
    form.reset();
    setMessage("投稿成功，已展示在画廊顶部！");
  } catch (err) {
    setMessage(err.message || "投稿失败，请稍后重试。", true);
  }
});

loadPosts();
