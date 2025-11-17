import React, { useState, useEffect, useRef } from "react";

export default function ChatApp() {
  const [messages, setMessages] = useState([
    { id: 0, role: "system", text: "Сәлеметсізбе! Не сұрағыңыз бар?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userId = Date.now();
    setMessages(prev => [...prev, { id: userId, role: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
      const API_KEY = "AIzaSyDAPjszXu4jJmoivRQpbp30pNZjueEZysc"; // Вставь сюда свой ключ

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: input }
            ]
          }
        ]

      };

      console.log("=== Отправка запроса Google Gemini ===");
      console.log(JSON.stringify(payload, null, 2));

      const res = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log("HTTP статус:", res.status);

      const data = await res.json();
      console.log("=== Ответ от Google Gemini ===");
      console.log(JSON.stringify(data, null, 2));

      // Парсим ответ
      let replyText = "Ошибка: нет ответа";
      if (data.candidates && data.candidates.length > 0) {
        // Если API возвращает candidates
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          replyText = candidate.content.parts[0].text || replyText;
        }
      } else if (data.contents && data.contents.length > 0) {
        // Альтернативная структура ответа
        const content0 = data.contents[0];
        if (content0.parts && content0.parts.length > 0) {
          replyText = content0.parts[0].text || replyText;
        }
      }

      setMessages(prev => [...prev, { id: userId + 1, role: "assistant", text: replyText }]);
    } catch (err) {
      console.error("Ошибка запроса к API:", err);
      setMessages(prev => [...prev, { id: Date.now(), role: "assistant", text: "Ошибка сервера: " + (err.message || err) }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const styles = {
    container: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f1f5f9", padding: 16 },
    chatBox: { width: "100%", maxWidth: 768, height: "80vh", display: "grid", gridTemplateRows: "auto 1fr auto", background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" },
    header: { padding: 16, borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" },
    main: { padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 },
    footer: { padding: 16, borderTop: "1px solid #ddd", display: "flex", gap: 12 },
    userMsg: { alignSelf: "flex-end", maxWidth: "75%", padding: 12, borderRadius: 24, backgroundColor: "#4f46e5", color: "white", whiteSpace: "pre-wrap", wordWrap: "break-word" },
    assistantMsg: { alignSelf: "flex-start", maxWidth: "75%", padding: 12, borderRadius: 24, backgroundColor: "white", color: "#1e293b", border: "1px solid #ddd", whiteSpace: "pre-wrap", wordWrap: "break-word" },
    typing: { alignSelf: "flex-start", maxWidth: "40%", padding: 12, borderRadius: 24, backgroundColor: "white", color: "#6b7280", border: "1px solid #ddd", fontStyle: "italic" },
    textarea: { flex: 1, padding: 12, borderRadius: 16, border: "1px solid #ccc", resize: "none", outline: "none" },
    button: { padding: "12px 20px", borderRadius: 16, border: "none", backgroundColor: "#4f46e5", color: "white", cursor: "pointer", opacity: loading ? 0.5 : 1 }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <header style={styles.header}>
          <h1>AI Study</h1>
          <span style={{ fontSize: 14, color: "#64748b" }}>API режим</span>
        </header>
        <main ref={chatRef} style={styles.main}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={msg.role === "user" ? styles.userMsg : styles.assistantMsg}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={styles.typing}>Печатает...</div>
            </div>
          )}
        </main>
        <footer style={styles.footer}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Напиши сообщение..."
            rows={2}
            style={styles.textarea}
          />
          <button onClick={sendMessage} disabled={loading} style={styles.button}>Отправить</button>
        </footer>
      </div>
    </div>
  );
}
