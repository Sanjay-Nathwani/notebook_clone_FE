import React, { useState } from 'react';
import './App.css';
import UploadPage from './components/UploadPage';
import ChatPage from './components/ChatPage';

function App() {
  const [currentPage, setCurrentPage] = useState('upload');
  const [documentData, setDocumentData] = useState(null);

  const handleUploadComplete = (data) => {
    setDocumentData(data);
    setCurrentPage('chat');
  };

  const handleBackToUpload = () => {
    setCurrentPage('upload');
    setDocumentData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'upload' ? (
        <UploadPage onUploadComplete={handleUploadComplete} />
      ) : (
        <ChatPage 
          documentData={documentData} 
          onBack={handleBackToUpload}
        />
      )}
    </div>
  );
}

export default App;