import React, { useState } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { api } from '../../api/client';

const suggestedPrompts = ['Total utang?', "Who's high risk?", 'Most overdue?'];

function getChatErrorMessage(error) {
  const providerMessage = String(error?.message || '').toLowerCase();
  if (
    error?.status === 429
    || providerMessage.includes('insufficient credit')
    || providerMessage.includes('insufficient token')
    || providerMessage.includes('out of credit')
  ) {
    return 'AI credits are unavailable right now. Please check the OpenRouter account or API key billing, then try again.';
  }

  return error?.message || 'I could not reach the AI assistant. Please try again.';
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const submitMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    const text = message.trim();
    setMessage('');
    setMessages((current) => [...current, { role: 'user', text }]);
    setIsLoading(true);
    try {
      const data = await api.post('/chat', { message: text });
      setMessages((current) => [...current, { role: 'assistant', text: data.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', text: getChatErrorMessage(error), error: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        className="chatbot-launcher"
        onClick={() => setIsOpen(true)}
        aria-label="Open ListaWise AI assistant"
      >
        <img src="/chatbot-logo.png" alt="" />
      </button>
    );
  }

  return (
    <section className="chatbot-widget" aria-label="ListaWise AI assistant">
      <header className="chatbot-header">
        <div className="chatbot-identity">
          <img src="/chatbot-logo.png" alt="" />
          <div>
            <strong>ListaWise AI</strong>
            <span><i /> Online</span>
          </div>
        </div>
        <button type="button" className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close assistant">
          <X size={18} />
        </button>
      </header>

      <div className="chatbot-messages">
        <div className="chatbot-message-row assistant">
          <img src="/chatbot-logo.png" alt="" />
          <p>Hi! I&apos;m your ListaWise AI assistant.<br />Ask me anything about your store&apos;s credit data.</p>
        </div>
        {messages.map((item, index) => (
          <div
            className={`chatbot-message-row ${item.role}${item.error ? ' error' : ''}`}
            key={`${item.role}-${index}`}
            role={item.error ? 'alert' : undefined}
          >
            {item.role === 'assistant' && <img src="/chatbot-logo.png" alt="" />}
            <p>{item.text}</p>
          </div>
        ))}
        {isLoading && <div className="chatbot-message-row assistant"><p>Thinking...</p></div>}
      </div>

      <div className="chatbot-prompts">
        {suggestedPrompts.map((prompt) => (
          <button type="button" key={prompt} onClick={() => setMessage(prompt)}>
            {prompt}
          </button>
        ))}
      </div>

      <form className="chatbot-composer" onSubmit={submitMessage}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about your store..."
          aria-label="Ask ListaWise AI"
        />
        <button type="submit" aria-label="Send message" disabled={!message.trim()}>
          <ArrowUp size={17} />
        </button>
      </form>
    </section>
  );
}
