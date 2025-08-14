import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

const UploadPage = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size must be less than 50MB');
      return;
    }

    console.log('Starting file upload:', file.name, 'Size:', file.size);

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('pdf', file);

    console.log('FormData created, PDF file appended');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`/api/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status, 'Response:', errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      setUploadProgress(100);

      setTimeout(() => {
        onUploadComplete(result);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(`Failed to upload file: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            NotebookLM Clone
          </h1>
          <p className="text-gray-600">
            Upload your PDF to start chatting with your document
          </p>
        </div>

        {!isUploading ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload PDF to start chatting
            </h3>
            <p className="text-gray-600 mb-4">
              Click or drag and drop your file here
            </p>
            <p className="text-sm text-gray-500">
              Maximum file size: 50MB
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              {uploadProgress < 100 ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              )}
              <span className="text-lg font-medium">
                {uploadProgress < 100 ? 'Uploading PDF' : 'Upload Complete!'}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
            
            {uploadProgress === 100 && (
              <p className="text-sm text-gray-600">
                Processing complete. Redirecting to chat...
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default UploadPage;