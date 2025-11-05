import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'contexts/ThemeContext';
import { LoginPage } from 'pages/LoginPage';
import { ToolsWorkflowPage } from 'pages/ToolsWorkflowPage';
import { LocalAssistantsPage } from 'pages/LocalAssistantsPage';
import { TextChunksPage } from 'pages/TextChunksPage';

export const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tools-workflow" element={<ToolsWorkflowPage />} />
          <Route path="/local-assistants" element={<LocalAssistantsPage />} />
          <Route path="/text-chunks" element={<TextChunksPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};
