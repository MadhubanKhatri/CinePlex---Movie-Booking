import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../assets/AgentWidget.css'; 

const AgentWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [movies, setMovies] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          type: 'agent',
          text: 'Hello! How can I help you today?',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'agent',
        content: msg.text,
      }));

      const response = await axios.post(
        'http://127.0.0.1:8000/api/ai_agent_test/',
        {
          message: input,
          history: history,
        }
      );
      console.log("Agent response:", response.data);
      
      const parsedData = JSON.parse(response.data.reply);
      const showtimesString = parsedData["data"].join(', ');
      const showtimes = showtimesString.split(',').map(item => item.trim()).filter(item => item);
      
      console.log("Parsed showtimes:", showtimes);
      setMovies(showtimes);

      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent',
        data: showtimes,
        isCard: true,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error("Error:", err);
      setError('Failed to get response. Please try again.');
      const errorMessage = {
        id: Date.now() + 1,
        type: 'agent',
        text: 'Sorry, I encountered an error. Please try again.',
        isCard: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="agent-widget">
      {isOpen && (
        <div className="agent-chat-window" role="dialog" aria-label="AI Agent Chat">
          <div className="agent-header">
            <h3>Agent Assistant</h3>
            <button
              className="agent-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="agent-messages" role="log" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`agent-message agent-message-${message.type}`}
              >
                {message.isCard && message.data ? (
                  <div className="agent-cards-container">
                    {message.data.map((showtime, idx) => (
                      <div key={idx} className="agent-showtime-card">
                        <p className="agent-showtime-text">{showtime}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="agent-message-bubble">
                    <p>{message.text}</p>
                    <span className="agent-message-time">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="agent-message agent-message-agent">
                <div className="agent-message-bubble">
                  <div className="agent-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="agent-input-form" onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              className="agent-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Message input"
            />
            <button
              type="submit"
              className="agent-send-btn"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        className={`agent-launcher ${isOpen ? 'active' : ''}`}
        onClick={toggleWidget}
        aria-label="Open chat"
        aria-expanded={isOpen}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
  );
};

export default AgentWidget;
