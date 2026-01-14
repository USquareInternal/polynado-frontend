'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined, 
  ExclamationCircleOutlined,
  LineChartOutlined 
} from '@ant-design/icons';
import { useWalletValidation } from '@/hooks/useWalletValidation';
import { getToken } from '@/services/authService';

const PolynodoChatbot: React.FC = () => {
  // Validate wallet address mapping
  useWalletValidation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm your Polynado AI assistant. I can help you analyze prediction markets, check volumes, and summarize price action. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      timestamp: new Date()
    };

    const questionText = input.trim();
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Please login to use the chatbot');
      }

      const response = await fetch('https://polynado-backend-testnet.onrender.com/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: questionText
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response from chatbot');
      }

      if (data.success && data.data && data.data.answer) {
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: data.data.answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Invalid response format from chatbot');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get response. Please try again.';
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const suggestedQuestions = [
    "Which election market has the highest volume?",
    "Show me markets with the biggest mispricings",
    "Summarize price action for top trending markets"
  ];

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <MainLayout>
      <div 
        className="flex flex-col fixed bg-[#000000] overflow-hidden lg:ml-20 z-30"
        style={{
          top: '64px', // Header height (h-16 = 64px)
          left: '0',
          right: '0',
          bottom: '0',
        }}
      >
        {/* Subtle circuit board pattern background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Header */}
        <div className="bg-[#1E2022]/80 backdrop-blur-sm border-b border-gray-700/50 px-6 xl:px-12 fullhd:px-16 py-4 xl:py-6 fullhd:py-8 shadow-lg relative z-10">
          <div className="max-w-6xl xl:max-w-[1600px] fullhd:max-w-[1800px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 xl:gap-4 fullhd:gap-6">
              <div 
                className="w-10 h-10 xl:w-12 xl:h-12 fullhd:w-14 fullhd:h-14 rounded-lg flex items-center justify-center"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                  boxShadow: '0 0 15px rgba(219, 122, 35, 0.4)',
                }}
              >
                <LineChartOutlined className="text-xl xl:text-2xl fullhd:text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">Polynado AI</h1>
                <p className="text-sm xl:text-base fullhd:text-lg text-gray-400">Market Intelligence Assistant</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 xl:gap-3 fullhd:gap-4 px-3 xl:px-4 fullhd:px-5 py-1.5 xl:py-2 fullhd:py-2.5 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 xl:w-2.5 xl:h-2.5 fullhd:w-3 fullhd:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs xl:text-sm fullhd:text-base text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 xl:px-12 fullhd:px-16 py-3 xl:py-4 fullhd:py-5 relative z-10">
          <div className="max-w-6xl xl:max-w-[1600px] fullhd:max-w-[1800px] mx-auto flex items-center gap-3 xl:gap-4 fullhd:gap-6">
            <ExclamationCircleOutlined className="text-amber-500 flex-shrink-0 text-base xl:text-lg fullhd:text-xl" />
            <p className="text-sm xl:text-base fullhd:text-lg text-amber-200">
              <strong>Disclaimer:</strong> This is not financial advice. All market insights are for informational purposes only. Trade at your own risk.
            </p>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 xl:px-12 fullhd:px-16 py-6 xl:py-8 fullhd:py-10 relative z-10">
          <div className="max-w-4xl xl:max-w-5xl fullhd:max-w-6xl mx-auto space-y-6 xl:space-y-8 fullhd:space-y-10">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.type === 'bot' 
                      ? '' 
                      : 'bg-gray-800'
                  }`}
                  style={message.type === 'bot' ? {
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '0 0 10px rgba(219, 122, 35, 0.3)',
                  } : {}}
                >
                  {message.type === 'bot' ? (
                    <RobotOutlined className="text-sm text-white" />
                  ) : (
                    <UserOutlined className="text-sm text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[75%] ${
                  message.type === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div 
                    className={`rounded-2xl px-4 py-3 ${
                      message.type === 'bot'
                        ? 'bg-[#1E2022] text-gray-100 border border-gray-700/50'
                        : ''
                    }`}
                    style={message.type === 'user' ? {
                      backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                      boxShadow: '0 2px 8px rgba(219, 122, 35, 0.3)',
                      color: 'white',
                    } : {}}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                    boxShadow: '0 0 10px rgba(219, 122, 35, 0.3)',
                  }}
                >
                  <RobotOutlined className="text-sm text-white" />
                </div>
                <div className="bg-[#1E2022] border border-gray-700/50 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Questions (shown when chat is empty) */}
        {messages.length === 1 && (
          <div className="px-4 pb-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm text-gray-400 mb-3">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(question)}
                    className="px-4 py-2 bg-[#1E2022] hover:bg-gray-800 border border-gray-700/50 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-[#1E2022]/80 backdrop-blur-sm border-t border-gray-700/50 px-4 py-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 bg-[#0a0a0a] border border-gray-700/50 rounded-2xl overflow-hidden focus-within:border-orange-500/50 transition-colors">
                <textarea
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about market data, volumes, trends..."
                  rows={1}
                  className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 resize-none focus:outline-none text-sm overflow-hidden"
                  style={{ maxHeight: '120px', minHeight: '48px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={!input.trim() || isTyping ? {
                  backgroundColor: '#1E2022',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                } : {
                  backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
                  boxShadow: '0 4px 15px rgba(219, 122, 35, 0.4), 3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
                }}
              >
                <SendOutlined className="text-lg text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PolynodoChatbot;

