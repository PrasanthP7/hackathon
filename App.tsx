import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeEditor } from './components/ThemeEditor';
import { ChatWindow } from './components/chatbot/ChatWindow';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-gray-50">
        {/* Left Sidebar: Theme Controls */}
        <ThemeEditor />
        
        {/* Right Area: Chatbot Preview */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Live Preview</h2>
          </div>
          
          <ChatWindow />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;