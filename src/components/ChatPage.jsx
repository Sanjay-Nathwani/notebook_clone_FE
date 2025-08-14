import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, FileText, User, Bot } from 'lucide-react';
import PDFViewer from './PDFViewer';

const ChatPage = ({ documentData, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `Hello! I'm ready to help you analyze "${documentData.fileName}". You can ask me questions about the document's content, request summaries, or explore specific topics. What would you like to know?`,
        timestamp: new Date()
      }
    ]);
  }, [documentData.fileName]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://notebook-clone-be.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: documentData.fileId,
          message: inputMessage,
          chatHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const result = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: result.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content) => {
    // Simple formatting for better readability
    return content.split('\n').map((line, index) => (
      <p key={index} className="mb-2 last:mb-0">
        {line}
      </p>
    ));
  };

  const suggestedQuestions = [
    "What is the main topic of this document?",
    "Can you summarize the key points?",
    "What are the main conclusions or recommendations?",
    "Are there any important statistics or data points?"
  ];

  return (
    <div className="h-screen flex">
      {/* Chat Section */}
      <div className={`flex flex-col ${showPdf ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {documentData.fileName}
                </h1>
                <p className="text-sm text-gray-500">
                  {documentData.pages} pages
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPdf(!showPdf)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showPdf ? 'Hide PDF' : 'View PDF'}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-6 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user'
                        ? 'bg-purple-600 ml-3'
                        : 'bg-gray-200 mr-3'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm">
                      {formatMessage(message.content)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="mt-8">
                <p className="text-sm text-gray-600 mb-4">Try asking:</p>
                <div className="grid gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <p className="text-sm text-gray-700">{question}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about the document..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={1}
                  style={{
                    minHeight: '48px',
                    maxHeight: '120px',
                    overflowY: inputMessage.split('\n').length > 3 ? 'auto' : 'hidden'
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      {showPdf && (
        <div className="w-1/2 border-l border-gray-200">
          <PDFViewer documentData={documentData} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;