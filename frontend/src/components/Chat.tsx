
import React, { useState, useRef, useEffect } from 'react';
import { IoIosSend } from 'react-icons/io';

interface Citation {
  page: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
}

interface ChatProps {
  docId: string;                                      // Document ID (usually filename)
  onCitationClick: (page: number) => void;            // Called when user clicks a page citation button
  starterMsg?: string;                                 // Optional initial prompt injected into chat
}

/**
 * Chat component for interacting with the document.
 * - Displays conversation history (user and assistant messages)
 * - Supports clicking citations to navigate PDF pages
 * - Supports sending questions to backend chat API
 */
const Chat: React.FC<ChatProps> = ({ docId, onCitationClick, starterMsg }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to latest message on new messages appended
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inject starter message once when component mounts or starterMsg changes
  useEffect(() => {
    if (starterMsg && !initializedRef.current) {
      initializedRef.current = true;
      setInput(starterMsg);
      // Delay sending starter message slightly to ensure component is ready
      setTimeout(() => {
        sendQuestion(starterMsg);
      }, 100);
    }
  }, [starterMsg]);

  /**
   * Send a user question to backend chat API
   * Adds user message immediately, then appends assistant's response or error.
   * @param question User's question string
   */
  const sendQuestion = async (question: string) => {
    if (!question.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    setInput('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, question }),
      });

      if (!response.ok) {
        // Attempt to parse server-sent error message if available
        let errMsg = `Server error: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch {
          // Ignore JSON parse errors here
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: data.answer ?? 'No answer.', citations: data.citations },
      ]);
      inputRef.current?.focus();
    } catch (error) {
      // Show the error message as assistant reply
      setMessages(prev => [...prev, { role: 'assistant', text: `❗ ${error instanceof Error ? error.message : String(error)}` }]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form submission of the chat input
   * @param e Form event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="rounded-2xl bg-white/85 min-h-[500px] max-w-xl mx-auto shadow-lg p-0 overflow-hidden border border-gray-200 flex flex-col">
      <header className="bg-gradient-to-r from-indigo-100 to-indigo-300 px-6 py-4 text-center font-bold text-gray-700 border-b">
        Chat about the document
      </header>

      <div className="p-6 space-y-4 overflow-y-auto flex-grow bg-white">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 select-none py-10">
            Start a conversation by typing your question below.
          </p>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`inline-block p-3 rounded-lg max-w-xs shadow break-words whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl'
                  : 'bg-gray-100 text-black rounded-tr-xl rounded-bl-xl rounded-br-xl'
              }`}
            >
              <p>{msg.text}</p>

              {msg.role === 'assistant' && msg.citations?.length && (
                <div className="mt-3 flex flex-wrap gap-2 select-none">
                  {msg.citations.map((citation, i) => (
                    <button
                      key={i}
                      type="button"
                      className="bg-indigo-100 text-indigo-700 font-medium px-3 py-1 rounded-full shadow border border-indigo-200 hover:bg-indigo-200 transition"
                      title={`Go to page ${citation.page}`}
                      onClick={() => onCitationClick(citation.page)}
                    >
                      Page {citation.page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex border-t px-4 py-3 gap-2 bg-white">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask me anything about the PDF..."
          className="flex-grow p-2 border border-gray-300 rounded outline-indigo-400"
          value={input}
          disabled={loading}
          onChange={e => setInput(e.target.value)}
          autoComplete="off"
          spellCheck="false"
          aria-label="Chat input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          <IoIosSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
