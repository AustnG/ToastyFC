import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, GeminiChat } from '../types';
import ChatMessageBubble from '../components/ChatMessageBubble';
import LoadingSpinner from '../components/LoadingSpinner';
import { geminiService } from '../services/geminiService';
import { PRIMARY_COLOR, ACCENT_COLOR, TEAM_NAME, MaterialSendIcon, MaterialSparklesIcon, THEME_WHITE, THEME_BLACK } from '../constants';

const FanZonePage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatInstanceRef = useRef<GeminiChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const initializeChat = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const chat = geminiService.startChatSession();
      chatInstanceRef.current = chat;

      const initialBotMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `Hey there! I'm Toasty, the official AI mascot for ${TEAM_NAME}! 🔥 What's on your mind? Ask me anything about the team, soccer, or just tell me your favorite chant!`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([initialBotMessage]);

    } catch (e) {
      console.error("Failed to initialize chat:", e);
      let specificError = "Sorry, I'm having a bit of trouble starting up. Please try again later.";
      if (e instanceof Error) {
        if (e.message.includes("API_KEY") || e.message.includes("VITE_API_KEY")) {
          specificError = "Gemini API Key not configured. Please ensure the API_KEY environment variable is set and you have restarted the server.";
        } else if (e.message.includes("Could not initialize chat")) {
          specificError = e.message; // Use the more specific error from geminiService
        }
      }
      setError(specificError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isLoading || !chatInstanceRef.current) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userInput.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const botResponseText = await geminiService.sendMessageToChat(chatInstanceRef.current, userMessage.text);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Oops! Something went wrong trying to get a response. Please try again.");
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I couldn't process that. Let's try something else!",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
      <header className={`bg-[${PRIMARY_COLOR}] text-[${THEME_BLACK}] p-4 flex items-center justify-center shadow-md`}>
        <MaterialSparklesIcon className="mr-3" style={{ fontSize: '32px' }} />
        <h1 className="text-2xl font-bold">Ask Toasty Bot!</h1>
      </header>

      <div className="flex-grow p-6 overflow-y-auto space-y-4 chat-scroll">
        {messages.map(msg => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
           <div className="flex justify-start mb-4">
             <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow bg-gray-200 text-gray-800 rounded-bl-none">
                <LoadingSpinner size="sm" text="Toasty is thinking..." />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="p-4 text-center text-red-600 bg-red-100 border-t border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isLoading ? "Toasty is replying..." : (error && !chatInstanceRef.current ? "Chat is unavailable." : `Ask ${TEAM_NAME} Bot anything...`)}
            className={`flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] transition-shadow`}
            disabled={isLoading || !chatInstanceRef.current || !!error}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim() || !chatInstanceRef.current || !!error}
            className={`p-3 rounded-lg text-[${THEME_WHITE}] bg-[${ACCENT_COLOR}] hover:bg-[${ACCENT_COLOR}]/90 focus:ring-2 focus:ring-[${ACCENT_COLOR}] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center`}
            aria-label="Send message"
          >
            <MaterialSendIcon style={{ fontSize: '20px' }} />
            <span className="sr-only">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FanZonePage;