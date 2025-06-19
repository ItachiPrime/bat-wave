// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from "@/components/ui/toaster";

console.log("🔥 main.tsx script executed/re-executed. Timestamp:", new Date().toLocaleString()); // <-- ADD THIS
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  console.log("🚀 ReactDOM.createRoot().render() called. Timestamp:", new Date().toLocaleString()); // <-- ADD THIS
  root.render(
    <React.StrictMode>
        <App />
        <Toaster />
    </React.StrictMode>,
  );
} else {
  console.error("❌ Root element with ID 'root' not found in document!");
}