# 🧠 LLM Context Extension

> **Never lose your chat context again.** A browser extension that converts any LLM chat interface (ChatGPT, Claude, Gemini, etc.) into a clean Markdown file — so you can seamlessly continue your conversation in another LLM when you run out of tokens.

---

## 📌 What is this?

When you're deep in a long conversation with an AI assistant and hit the **token/context limit**, your only option is usually to start fresh — losing all the rich context you built up.

**LLM Context Extension** solves this by:
1. Capturing the full **DOM/HTML** of your current LLM chat page
2. **Markdownifying** it into a clean, structured `.md` file
3. Letting you **download and share** that file with any other LLM as a context seed

You can use this on:
- [ChatGPT](https://chat.openai.com)
- [Claude](https://claude.ai)
- [Google Gemini](https://gemini.google.com)
- Any other LLM web interface

---

## ✨ Features

-  Converts live chat DOM to clean Markdown in one click
-  Downloads the Markdown file directly to your machine
-  Works across all major LLM chat frontends
-  Python backend handles the HTML-to-Markdown conversion
-  Manifest V3 compliant — compatible with modern Chrome/Edge/Brave

---

## 🗂️ File Structure

```
llm-context-extension/
│
├── extension/                  # Browser extension (frontend)
│   ├── manifest.json           # Extension manifest (V3)
│   ├── popup.html              # Extension popup UI
│   ├── popup.js                # Popup logic — captures DOM, talks to backend
│   ├── content.js              # Content script injected into chat pages
│   ├── background.js           # Service worker (Manifest V3)
│
├── backend/                    # Python backend
│   ├── main.py                 # FastAPI server — receives HTML, returns Markdown
│   ├── converter.py            # Core HTML-to-Markdown conversion logic
│   └── requirements.txt        # Python dependencies
│
└── README.md
```

> **Note:** The actual file structure may vary slightly. This reflects the standard layout for this type of project.

---

## 🛠️ Setup & Installation

### Prerequisites

- Python 3.8+
- Google Chrome, Microsoft Edge, or any Chromium-based browser
- `pip` (Python package manager)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Aritra-Karan47/llm-context-extension.git
cd llm-context-extension
```

---

### Step 2 — Set Up the Python Backend

```bash
cd backend
pip install -r requirements.txt
```

Start the backend server:

```bash
python app.py
```

The server will start at `http://localhost:5000` (or whichever port is configured). **Keep this running** while using the extension.

---

### Step 3 — Load the Extension in Your Browser

#### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the `extension/` folder from the cloned repository
5. The extension icon will appear in your toolbar

---

## 🚀 How to Use

1. **Open any LLM chat** in your browser (ChatGPT, Claude, Gemini, etc.)
2. Have a conversation until you're close to the context/token limit
3. Click the **LLM Context Extension icon** in your browser toolbar
4. Click **"Markdownify & Download"**
5. A `.md` file will be downloaded containing your full chat history
6. **Open a new LLM chat** and upload or paste the contents of the `.md` file
7. The new LLM now has the full context of your previous conversation ✅

---

## 💡 Example Use Case

```
You're debugging a complex issue with Claude.ai and hit the context window limit.

→ Click the extension
→ Download chat as context.md
→ Open ChatGPT or a fresh Claude session
→ Upload/paste context.md with a prompt like:
   "Here is my previous conversation. Please continue helping me from where we left off."

The new LLM session picks up exactly where you left off.
```

---

## 🔧 Configuration

If your Python backend runs on a port other than `5000`, update the endpoint URL in the extension's `popup.js`:

```js
// popup.js
const BACKEND_URL = "http://localhost:5000/convert"; // Change port if needed
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| Extension not appearing | Make sure Developer Mode is ON and you selected the correct `extension/` folder |
| Download not triggering | Ensure the Python backend is running (`python app.py`) |
| Empty or broken Markdown | Try refreshing the chat page and clicking the extension again |
| CORS errors in console | Ensure the backend has CORS enabled (check `app.py`) |
| Port conflict | Change the port in `app.py` and update `popup.js` accordingly |

---

## 🤝 Contributing

Contributions are welcome! To get started:

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "Add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

This project is open-source. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aritra Karan** — [@Aritra-Karan47](https://github.com/Aritra-Karan47)

---

> 💬 *"Your conversations are valuable. Don't let a token limit stop your flow."*