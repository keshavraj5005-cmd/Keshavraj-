/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Download, Sparkles, AlertTriangle, Loader2, Camera } from 'lucide-react';
import { processText, processImage } from './services/gemini';
import { generatePDF } from './utils/pdfGenerator';
import { motion, AnimatePresence } from 'motion/react';

function App() {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      
      setGeneratedContent(''); // Clear previous results
      setError(null);
    }
    // Reset inputs so same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const clearImages = () => {
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleProcess = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent('');

    try {
      let result = '';
      if (activeTab === 'text') {
        if (!inputText.trim()) {
          throw new Error("Please enter some text to process.");
        }
        result = await processText(inputText);
      } else {
        if (selectedImages.length === 0) {
          throw new Error("Please select at least one image to process.");
        }
        // We pass a generic prompt for image processing, or we could add an input for specific instructions
        result = await processImage(selectedImages, inputText || "Extract and format the text from these images into a clean document.");
      }
      
      if (result) {
        setGeneratedContent(result);
      } else {
        throw new Error("No content was generated. Please try again.");
      }
    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (generatedContent) {
      generatePDF(generatedContent, "india-mitra-doc.pdf");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
              IM
            </div>
            <h1 className="text-xl font-bold tracking-tight">India Mitra AI</h1>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Beta Preview
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-800">
            Document Intelligence for India
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Convert text and images into professional PDFs. Correct grammar, format documents, and organize your content instantly.
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'text' 
                    ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                Text to PDF
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'image' 
                    ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image to PDF
              </button>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'text' ? (
                  <motion.div
                    key="text-input"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Enter your text
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type or paste text here (Hindi or English)..."
                      className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none resize-none transition-all text-slate-700 placeholder:text-slate-400"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="image-input"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Upload or Scan Images
                    </label>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Upload Button */}
                      <div 
                        onClick={triggerFileUpload}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-orange-500" />
                        <span className="text-sm font-medium text-slate-700">Upload Files</span>
                      </div>

                      {/* Camera Button */}
                      <div 
                        onClick={triggerCamera}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Camera className="w-8 h-8 text-blue-500" />
                        <span className="text-sm font-medium text-slate-700">Open Camera</span>
                      </div>
                    </div>

                    <p className="text-xs text-center text-slate-400 mb-4">
                      Supports JPG, PNG. You can upload multiple images.
                    </p>

                    {imagePreviews.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500">{imagePreviews.length} images selected</span>
                          <button onClick={clearImages} className="text-xs text-red-500 hover:text-red-600">Clear all</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {imagePreviews.map((preview, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                              <img 
                                src={preview} 
                                alt={`Preview ${idx}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Optional Instructions
                      </label>
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="E.g., 'Extract text and format as a letter'"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleProcess}
                disabled={isLoading || (activeTab === 'text' && !inputText) || (activeTab === 'image' && selectedImages.length === 0)}
                className="w-full mt-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    Generate Document
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-medium text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Generated Output
              </h3>
              {generatedContent && (
                <button
                  onClick={handleDownloadPDF}
                  className="text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              )}
            </div>
            
            <div className="flex-1 p-6 bg-slate-50/50 overflow-auto">
              {error ? (
                <div className="h-full flex flex-col items-center justify-center text-red-500 gap-2 p-4 text-center">
                  <AlertTriangle className="w-8 h-8" />
                  <p className="font-medium">Error Processing Request</p>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              ) : generatedContent ? (
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap font-mono text-sm bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    {generatedContent}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm">AI output will appear here</p>
                </div>
              )}
            </div>
            
            {/* Safety Disclaimer */}
            <div className="p-3 bg-orange-50 border-t border-orange-100 text-[10px] text-orange-800 text-center">
              ⚠️ Note: This AI creates sample/practice formats only. Do not use for real government IDs (Aadhaar/PAN).
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;

