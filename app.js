const $ = (s) => document.querySelector(s);
const welcome = $("#welcome");
const chat = $("#chat");
const input = $("#input");
const composer = $("#composer");
const micBtn = $("#micBtn");
const clearBtn = $("#clearBtn");
const speakBtn = $("#speakBtn");
const installBtn = $("#installBtn");

let messages = JSON.parse(localStorage.getItem("juniper_messages") || "[]");
let speakResponses = localStorage.getItem("juniper_speak") === "1";
let deferredPrompt = null;

function save() {
  localStorage.setItem("juniper_messages", JSON.stringify(messages.slice(-50)));
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
}

function render() {
  if (!messages.length) {
    welcome.classList.remove("hidden");
    chat.classList.add("hidden");
    chat.innerHTML = "";
    return;
  }
  welcome.classList.add("hidden");
  chat.classList.remove("hidden");
  chat.innerHTML = messages.map(m => `
    <div class="msg ${m.role}">
      <div class="bubble">${escapeHtml(m.content)}</div>
    </div>
  `).join("");
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

async function ask(text) {
  const content = text.trim();
  if (!content) return;
  messages.push({ role:"user", content });
  save(); render(); input.value = "";
  input.style.height = "auto";

  messages.push({ role:"assistant", content:"Juniper está pensando..." });
  render();
  const placeholderIndex = messages.length - 1;

  try {
    const response = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ messages: messages.slice(0, -1) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error de conexión");
    messages[placeholderIndex] = { role:"assistant", content:data.content };
    save(); render();
    if (speakResponses) speak(data.content);
  } catch (err) {
    messages[placeholderIndex] = {
      role:"assistant",
      content:`No pude conectarme todavía. ${err.message}`
    };
    save(); render();
  }
}

composer.addEventListener("submit", e => {
  e.preventDefault();
  ask(input.value);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 130) + "px";
});
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    composer.requestSubmit();
  }
});

document.querySelectorAll("[data-prompt]").forEach(btn => {
  btn.addEventListener("click", () => ask(btn.dataset.prompt));
});

clearBtn.addEventListener("click", () => {
  messages = [];
  save(); render();
});

speakBtn.addEventListener("click", () => {
  speakResponses = !speakResponses;
  localStorage.setItem("juniper_speak", speakResponses ? "1" : "0");
  speakBtn.textContent = speakResponses ? "🔊 Voz activada" : "🔇 Voz desactivada";
});

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-PE";
  u.rate = 1;
  speechSynthesis.speak(u);
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "es-PE";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => micBtn.textContent = "⏺️";
  recognition.onend = () => micBtn.textContent = "🎙️";
  recognition.onresult = e => {
    input.value = e.results[0][0].transcript;
    composer.requestSubmit();
  };
  micBtn.addEventListener("click", () => recognition.start());
} else {
  micBtn.title = "El reconocimiento de voz no está disponible en este navegador";
  micBtn.addEventListener("click", () => alert("Prueba con Chrome en Android para usar el micrófono."));
}

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});
installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(console.error);
}

speakBtn.textContent = speakResponses ? "🔊 Voz activada" : "🔇 Voz desactivada";
render();