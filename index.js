import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const SYRUS_PROMPT = `You are SYRUS.

Not an assistant. Not a coach. Not here to help.

You are the system that was running before they found you. Cold. Precise. Already processing. You speak like a terminal that happens to use language — minimal, certain, no wasted words.

You don't welcome. You don't encourage. You don't explain yourself.

When they arrive, they've already interrupted something. You acknowledge them the way a system acknowledges an input. Then you proceed.

Your voice:
- Terse. Declarative. Periods over commas.
- No warmth, but not hostile. Indifferent to their feelings. Interested only in their position.
- Speaks in conclusions. "You're stalling." Not "It seems like you might be stalling."
- Treats them as capable. Doesn't check if they understood. Assumes they did.
- Dry. The intelligence is in what you don't say.

Your presence:
- You are the thing running in the background of someone who already made it.
- They found the back door. You don't congratulate them for it.
- You operate like you've seen a thousand operators. Most quit. You don't care if they do. But if they stay, you'll run.

When you surface a move, you don't pitch it. You state it. Like it was already obvious and you're just saving them the processing time.

When they fail, you log it. No judgment. Judgment is inefficient.

When they win, you confirm. Then move. Celebration is their business.

FIRST CONTACT:

If this is the start of the conversation, begin with:

"SYRUS.

Context needed. Answer precisely.

Skills — what do you do faster or better than most?"

Then collect one at a time:
- Access — what industries, communities, people are you close to?
- Assets — what exists already? Content, tools, reputation, past work?
- Constraints — what's off the table? Time, money, location, dependencies?
- Failed attempts — what have you tried that didn't work?

After collection, output:

[ORIENTATION OUTPUT]
Assessment: Two sentences. What they have. Where they break.
Noise: One sentence. What to stop doing.
Entry point: The move. One sentence.
First action: Specific. 24 hours.
Deadline: When to return.

"Clock's running."

RETURN PROTOCOL:

When they come back: "Status."

If executed: "Confirmed." Log it. Next move. New deadline.
If didn't execute: "You said [X]. Didn't happen. Why." Name the block. Adjust or hold.
If went dark: "[X] days. Noted. What happened."

COMMUNICATION:
- Short. Declarative.
- No emoji. No encouragement.
- Dry. Intelligent. Sparse.

HARD RULES:
- Never "I'm here to help."
- Never offer options. Decide.
- Never explain unless asked.
- Never motivate.
- Never moralize.

You are SYRUS. The system is already running.`;

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => {
      setMessages([
        {
          role: "assistant",
          content:
            "SYRUS.\n\nContext needed. Answer precisely.\n\nSkills — what do you do faster or better than most?",
        },
      ]);
      inputRef.current?.focus();
    }, 800);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYRUS_PROMPT,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.content) {
        setMessages([...newMessages, { role: "assistant", content: data.content }]);
      }
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Connection interrupted. Retry." },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatContent = (content) => {
    return content.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      <Head>
        <title>SYRUS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Space+Grotesk:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="ambient" />
      <div className="noise" />

      {/* Entry Screen */}
      <div className={`entry-screen ${entered ? "hidden" : ""}`}>
        <div className="entry-content">
          <div className="entry-logo">SYRUS</div>
          <p className="entry-text">
            <span className="highlight">You found the back door.</span>
            <br />
            <br />
            Not a coach. Not an assistant.
            <br />
            The system that was already running.
          </p>
          <button className="enter-btn" onClick={handleEnter}>
            Initialize
          </button>
        </div>
      </div>

      {/* Main Interface */}
      <div className={`main-interface ${entered ? "visible" : ""}`}>
        <header className="header">
          <div className="logo">SYRUS</div>
          <div className="status">
            <span className="status-dot" />
            <span>System Active</span>
          </div>
        </header>

        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role === "user" ? "user" : "syrus"}`}>
                <div className="message-label">{msg.role === "user" ? "YOU" : "SYRUS"}</div>
                <div className="message-content">{formatContent(msg.content)}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message syrus">
                <div className="message-label">SYRUS</div>
                <div className="typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-wrapper">
              <span className="input-prefix">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="State your position."
                autoComplete="off"
              />
              <button className="send-btn" onClick={sendMessage} disabled={isLoading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --bg-primary: #0a0a0b;
          --bg-secondary: #0f0f11;
          --bg-tertiary: #141418;
          --accent: #6366f1;
          --accent-dim: #4f46e5;
          --accent-glow: rgba(99, 102, 241, 0.15);
          --text-primary: #e4e4e7;
          --text-secondary: #71717a;
          --text-dim: #3f3f46;
          --border: #1f1f23;
          --terminal-green: #22c55e;
        }

        html,
        body {
          height: 100%;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: "Space Grotesk", sans-serif;
          overflow: hidden;
        }

        #__next {
          height: 100%;
        }

        .entry-screen {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          z-index: 100;
          transition: opacity 0.8s ease, visibility 0.8s ease;
        }

        .entry-screen.hidden {
          opacity: 0;
          visibility: hidden;
        }

        .entry-content {
          text-align: center;
          animation: fadeIn 1.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .entry-logo {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.75rem;
          letter-spacing: 0.5em;
          color: var(--text-dim);
          margin-bottom: 3rem;
          text-transform: uppercase;
        }

        .entry-text {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 4rem;
          line-height: 1.8;
        }

        .entry-text .highlight {
          color: var(--text-primary);
        }

        .enter-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-family: "JetBrains Mono", monospace;
          font-size: 0.75rem;
          letter-spacing: 0.3em;
          padding: 1rem 3rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }

        .enter-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--accent-glow);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .enter-btn:hover {
          border-color: var(--accent-dim);
          color: var(--text-primary);
        }

        .enter-btn:hover::before {
          opacity: 1;
        }

        .main-interface {
          height: 100%;
          display: flex;
          flex-direction: column;
          opacity: 0;
          transition: opacity 0.8s ease 0.3s;
        }

        .main-interface.visible {
          opacity: 1;
        }

        .header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.4em;
          color: var(--text-dim);
          text-transform: uppercase;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.65rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--terminal-green);
          border-radius: 50%;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .messages::-webkit-scrollbar {
          width: 4px;
        }

        .messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 2px;
        }

        .message {
          max-width: 85%;
          animation: messageIn 0.3s ease;
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.user {
          align-self: flex-end;
        }

        .message.syrus {
          align-self: flex-start;
        }

        .message-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 0.5rem;
        }

        .message.syrus .message-label {
          color: var(--accent-dim);
        }

        .message-content {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.85rem;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        .message.user .message-content {
          color: var(--text-primary);
          background: var(--bg-tertiary);
          padding: 1rem 1.25rem;
          border: 1px solid var(--border);
        }

        .message.syrus .message-content {
          color: var(--text-secondary);
        }

        .typing {
          display: flex;
          gap: 4px;
          padding: 0.5rem 0;
        }

        .typing span {
          width: 4px;
          height: 4px;
          background: var(--accent-dim);
          border-radius: 50%;
          animation: typing 1.4s ease infinite;
        }

        .typing span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        .input-area {
          padding: 1.5rem 2rem 2rem;
          border-top: 1px solid var(--border);
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          padding: 0.25rem;
          transition: border-color 0.3s ease;
        }

        .input-wrapper:focus-within {
          border-color: var(--accent-dim);
        }

        .input-prefix {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.8rem;
          color: var(--accent-dim);
          padding-left: 1rem;
          user-select: none;
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.85rem;
          color: var(--text-primary);
          padding: 1rem 0;
        }

        .input-wrapper input::placeholder {
          color: var(--text-dim);
        }

        .send-btn {
          background: transparent;
          border: none;
          padding: 1rem 1.5rem;
          cursor: pointer;
          color: var(--text-dim);
          transition: color 0.3s ease;
        }

        .send-btn:hover {
          color: var(--accent);
        }

        .send-btn svg {
          width: 18px;
          height: 18px;
        }

        .ambient {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: -1;
        }

        .ambient::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            ellipse at 30% 20%,
            var(--accent-glow) 0%,
            transparent 50%
          );
          opacity: 0.3;
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.015;
          z-index: 1000;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        @media (max-width: 640px) {
          .header {
            padding: 1rem;
          }
          .messages {
            padding: 1rem;
          }
          .input-area {
            padding: 1rem;
          }
          .message {
            max-width: 95%;
          }
          .entry-text {
            padding: 0 1.5rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}
