const input = document.getElementById("input");
const chat = document.getElementById("chat");
const modelDisplay = document.getElementById("model");

let selectedModel = "auto";

function setModel(button, model) {
  document.querySelectorAll(".models button").forEach(btn => {
    btn.classList.remove("active");
  });

  button.classList.add("active");
  selectedModel = model;
  modelDisplay.textContent = "⚡ " + model;
}

function ask(text) {
  input.value = text;
  sendMessage();
}

function handleKey(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  const text = input.value.trim();

  if (!text) return;

  const welcome = document.getElementById("welcome");
  if (welcome) welcome.remove();

  addMessage(text, "user");

  input.value = "";

  const loading = addMessage("⏳ جاري التفكير...", "ai");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: text
          }
        ]
      })
    });

    const data = await response.json();

    loading.remove();

    const answer =
      data?.choices?.[0]?.message?.content ||
      "لم تصل استجابة من النموذج.";

    addMessage(answer, "ai");

  } catch (error) {
    loading.remove();

    addMessage(
      "حدث خطأ في الاتصال بالخادم. سيتم إصلاح الربط في المرحلة التالية.",
      "ai"
    );
  }
}

function addMessage(text, type) {
  const message = document.createElement("div");

  message.className = "msg " + type;
  message.textContent = text;

  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;

  return message;
}

function newChat() {
  location.reload();
}

input.addEventListener("keydown", handleKey);
