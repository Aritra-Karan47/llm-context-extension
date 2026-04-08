const BACKEND_URL = "http://localhost:8000/convert";

document.getElementById("convertBtn").addEventListener("click", async () => {
  const btn = document.getElementById("convertBtn");
  const status = document.getElementById("status");
  btn.disabled = true;
  status.textContent = "Extracting chat...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // NEW: Use chat-specific extractor
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractMainChatContent          // ← CHANGED HERE
    });

    const { html, title } = results[0].result;

    // Size check (chat payloads are now tiny: 150-400 KB)
    const sizeMB = (new Blob([html]).size / (1024 * 1024)).toFixed(2);
    if (sizeMB > 5) {
      throw new Error(`Payload too large (${sizeMB} MB)`);
    }

    status.textContent = `Sending ${sizeMB} MB to backend...`;

    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, url: tab.url })
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    // Download
    const blob = new Blob([data.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);

    // Copy to clipboard
    await navigator.clipboard.writeText(data.markdown);

    status.innerHTML = `
      <span class="success"> Chat exported!</span><br>
      <small>${data.word_count} words • Only messages kept</small>
    `;
  } catch (err) {
    status.innerHTML = `<span class="error"> ${err.message}</span>`;
    console.error(err);
  } finally {
    btn.disabled = false;
  }
});

// ==================== NEW MAIN EXTRACTOR ====================
function extractMainChatContent() {
  const hostname = location.hostname.toLowerCase();
  let messages = [];

  // 1. Platform-specific stable selectors (battle-tested 2026)
  if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
    messages = document.querySelectorAll('article[data-message-author-role], [data-testid^="conversation-turn"], div[data-testid*="turn"]');
  } 
  else if (hostname.includes('claude.ai')) {
    messages = document.querySelectorAll('[data-testid="user-message"], [data-testid="assistant-message"], article[data-role], div.message');
  } 
 
  else if (hostname.includes('gemini.google.com')) {
    messages = document.querySelectorAll('share-turn-viewer, response-container, [data-turn], div[role="chat-turn"], article');
  }
  else if (hostname.includes('grok.com') || hostname.includes('x.com')) {
    // Grok renders turns inside .message-bubble or role-attributed divs
    messages = document.querySelectorAll(
      '[class*="message-bubble"], [class*="UserMessage"], [class*="AssistantMessage"], ' +
      '[class*="user-message"], [class*="assistant-message"], ' +
      '[data-testid*="message"], [data-testid*="turn"], ' +
      '[class*="conversation-turn"], [class*="ChatMessage"]'
    );

    // Grok fallback: grab the main scrollable chat column
    if (messages.length < 2) {
      const grokMain =
        document.querySelector('[class*="conversation"]') ||
        document.querySelector('[class*="chat-content"]') ||
        document.querySelector('main');
      if (grokMain) {
        messages = grokMain.querySelectorAll('div[class*="message"], div[class*="turn"], div[class*="bubble"]');
      }
    }
  }

  // 2. Smart fallback chain (works on new layouts & shared links)
  if (messages.length < 2) {
    const candidates = [
      document.querySelector('main'),
      document.querySelector('div[role="main"]'),
      document.querySelector('#chat-container'),
      document.querySelector('article'),
      ...Array.from(document.querySelectorAll('div')).filter(d => 
        d.scrollHeight > 800 && 
        d.textContent.trim().length > 500 &&
        !d.closest('header, nav, footer, aside')
      )
    ];

    const bestContainer = candidates.find(el => el);
    if (bestContainer) {
      messages = bestContainer.querySelectorAll('article, [data-testid*="message"], [data-role], div.message, [role="message"]');
    }
  }

  // 3. Ultimate fallback to legacy generic (for normal websites)
  if (messages.length === 0) {
    return extractCleanHTMLLegacy();
  }

  // 4. Build ultra-clean chat container
  const cleanChat = document.createElement('div');
  cleanChat.className = 'llm-chat-clean';

  messages.forEach((msg) => {
    const clone = msg.cloneNode(true);

    // Remove all UI bloat inside each turn
    clone.querySelectorAll(`
      button, svg, img:not([alt*="latex"]), 
      [role="button"], .copy-button, .feedback, 
      form, input, textarea, header, footer, nav, aside
    `).forEach(el => el.remove());

    // Remove hidden/aria-hidden elements
    clone.querySelectorAll('*').forEach(el => {
      if (el.hasAttribute('aria-hidden') || 
          el.style.display === 'none' || 
          el.style.visibility === 'hidden') {
        el.remove();
      }
    });

    // Add clear role header for better Markdown
    // Supports: data-attribute (ChatGPT), class-name (Grok), text heuristic (fallback)
    const classList = (msg.className || '').toLowerCase();
    const dataRole = msg.getAttribute('data-message-author-role') ||
                     msg.getAttribute('data-role');
    const isUser =
      dataRole === 'user' ||
      classList.includes('user') ||
      classList.includes('human') ||
      msg.closest('[data-message-author-role="user"]') !== null ||
      msg.closest('[class*="UserMessage"]') !== null ||
      msg.closest('[class*="user-message"]') !== null;

    const isAssistant =
      dataRole === 'assistant' ||
      classList.includes('assistant') ||
      classList.includes('bot') ||
      classList.includes('grok') ||
      msg.closest('[data-message-author-role="assistant"]') !== null ||
      msg.closest('[class*="AssistantMessage"]') !== null ||
      msg.closest('[class*="assistant-message"]') !== null;

    const role = isUser ? 'user' : isAssistant ? 'assistant' : null;
    if (role) {
      const label = document.createElement('h3');
      label.textContent = role === 'user' ? '👤 User' : '🤖 Assistant';
      cleanChat.appendChild(label);
    }

    cleanChat.appendChild(clone);
  });

  return {
    html: cleanChat.outerHTML,
    title: document.title
      .replace(/ - ChatGPT|Claude|Grok|Gemini|AI Chat/g, '')
      .trim() || "Chat Export"
  };
}

// ==================== LEGACY FALLBACK (unchanged) ====================
function extractCleanHTMLLegacy() {
  const clone = document.documentElement.cloneNode(true);
  clone.querySelectorAll("script, style, noscript, iframe, svg, canvas, link[rel*='stylesheet']").forEach(el => el.remove());
  return {
    html: clone.outerHTML,
    title: document.title || "Untitled"
  };
}