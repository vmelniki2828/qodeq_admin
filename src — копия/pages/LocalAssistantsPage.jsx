import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { Layout } from 'components/Layout';
import { HiPencil, HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight, HiTrash, HiDocumentText } from 'react-icons/hi2';
import { Notify, Confirm } from 'notiflix/build/notiflix-aio';

const PageContainer = styled.div`
  display: flex;
  height: 100%;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  width: ${({ $width, $isFullWidth }) => ($isFullWidth ? '100%' : `${$width}px`)};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  transition: opacity 0.3s ease, transform 0.3s ease, width 0.3s ease;
  ${({ $isHidden }) =>
    $isHidden &&
    `
    opacity: 0;
    transform: translateX(-20px);
    pointer-events: none;
    width: 0;
    overflow: hidden;
  `}
`;

const Divider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  cursor: col-resize;
  position: relative;
  transition: opacity 0.3s ease, transform 0.3s ease;
  ${({ $isHidden }) =>
    $isHidden &&
    `
    opacity: 0;
    transform: translateX(-20px);
    pointer-events: none;
    width: 0;
    overflow: hidden;
  `}

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  &::before {
    content: '';
    position: absolute;
    left: -4px;
    right: -4px;
    top: 0;
    bottom: 0;
    cursor: col-resize;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  position: relative;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  align-self: ${({ $isBack }) => ($isBack ? 'flex-start' : 'flex-end')};
  margin-bottom: 20px;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
  }
`;

const RightContent = styled.div`
  padding: 20px;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

const SettingsWrapper = styled.div`
  flex: 1;
`;

const EditModeContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const SettingsPanel = styled.div`
  width: ${({ $width }) => $width}%;
  min-width: 550px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s ease;
`;

const EditDivider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  cursor: col-resize;
  position: relative;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  &::before {
    content: '';
    position: absolute;
    left: -4px;
    right: -4px;
    top: 0;
    bottom: 0;
    cursor: col-resize;
  }
`;

const NewRightPanel = styled.div`
  width: ${({ $width }) => $width}%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s ease;
  background-color: ${({ theme }) =>
    theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};
  border-radius: 16px;
`;

const PlaygroundContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};
`;

const PlaygroundHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background-color: ${({ theme }) =>
    theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};
`;

const PlaygroundTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: ${({ theme }) =>
    theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) =>
      theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${({ $isUser, theme }) =>
    $isUser
      ? theme.colors.primary === '#0D0D0D'
        ? '#f0f0f0'
        : 'rgba(255,255,255,0.08)'
      : theme.colors.surface};
  align-self: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
  max-width: 80%;
`;

const MessageRole = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const MessageText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ChunksButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-transform: uppercase;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
  }
`;

const ChunksContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  position: relative;
`;

const ChunkBlock = styled.div`
  padding: 16px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) =>
    theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};
  flex: 1;
  min-width: 250px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChunkNavigationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.1)'};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChunkTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`;

const ChunkText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  background-color: ${({ theme }) =>
    theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SaveButton = styled.button`
  align-self: flex-end;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    opacity: 0.9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SettingSection = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
`;

const SettingLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  width: 180px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EditIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  outline: none;
  margin-bottom: 12px;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

const ModalToolsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B6B6B' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 12px;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  option {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ModalTextArea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
  height: 200px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const SettingContent = styled.div`
  flex: 1;
`;

const NumberInputContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
`;

const NumberInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
  text-align: center;

  &:focus {
    outline: none;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  -moz-appearance: textfield;
`;

const NumberInputButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 100%;
  padding: 0;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  transition: all 0.15s ease;
  border-left: ${({ $isRight }) => ($isRight ? '1px solid' : 'none')};
  border-right: ${({ $isRight }) => (!$isRight ? '1px solid' : 'none')};
  border-color: ${({ theme }) => theme.colors.border};
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f8f8f8' : 'rgba(255,255,255,0.04)'};
  }

  &:active {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ToolsListContainer = styled.div`
  width: 100%;
  max-height: 100px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.background};
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

const ToolsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ToolItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f8f8f8' : 'rgba(255,255,255,0.04)'};
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const ToolName = styled.span`
  flex: 1;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const ButtonsGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
  }

  ${({ $primary, theme }) =>
    $primary &&
    `
    background-color: ${theme.colors.accent};
    color: #FFFFFF;
    border-color: ${theme.colors.accent};

    &:hover {
      background-color: ${theme.colors.accentHover || theme.colors.accent};
      opacity: 0.9;
    }
  `}
`;

const AgentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AgentBlock = styled.div`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f8f8f8' : 'rgba(255,255,255,0.04)'};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  ${({ $selected, theme }) =>
    $selected &&
    `
    background-color: ${theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
    border-color: ${theme.colors.primary};
  `}
`;

const AgentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  gap: 12px;
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover {
    color: #ef4444;
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.15)'};
  }
`;

const AgentDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
`;

const AgentId = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 500;
`;

// Моковые данные агентов
const mockAgents = [
  { id: 1, description: 'Cat', project: 'Project Alpha' },
  { id: 2, description: 'Gama', project: 'Project Beta' },
  { id: 3, description: 'Daddy', project: 'Project Gamma' },
  { id: 5, description: 'Kent', project: 'Project Alpha' },
  { id: 6, description: 'R7', project: 'Project Beta' },
  { id: 7, description: 'Kometa', project: 'Project Delta' },
  { id: 8, description: 'Arkada', project: 'Project Gamma' },
  { id: 9, description: 'Motor', project: 'Project Alpha' },
];

// Список инструментов
const toolsList = [
  { name: 'deposit_ticket', id: 6 },
  { name: 'transfer', id: 7 },
  { name: 'deposit_ticket', id: 19 },
  { name: 'deposit_ticket', id: 13 },
  { name: 'deposit_ticket', id: 9 },
  { name: 'transfer', id: 14 },
  { name: 'deposit_ticket', id: 15 },
  { name: 'transfer', id: 20 },
  { name: 'transfer', id: 10 },
  { name: 'deposit_ticket', id: 11 },
  { name: 'transfer', id: 12 },
  { name: 'transfer', id: 16 },
  { name: 'transfer', id: 17 },
  { name: 'deposit_ticket', id: 18 },
];

// Список chunks
const chunksList = [
  178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195,
  196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213,
  214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231,
  232, 233, 234, 235, 236, 237, 238, 241, 242, 243, 244, 245, 548, 315,
].map((id) => `<TextChunk> (${id})`);

export const LocalAssistantsPage = () => {
  const { theme } = useTheme();
  const [leftWidth, setLeftWidth] = useState(400);
  const [agents, setAgents] = useState(mockAgents);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [selectedTools, setSelectedTools] = useState(new Set());
  const [isResizing, setIsResizing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChunksModalOpen, setIsChunksModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const [isRewriteInstructionModalOpen, setIsRewriteInstructionModalOpen] = useState(false);
  const [isToolCallingModalOpen, setIsToolCallingModalOpen] = useState(false);
  const [isToolDefinitionModalOpen, setIsToolDefinitionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chunksSearchQuery, setChunksSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedLocalization, setSelectedLocalization] = useState('');
  const [description, setDescription] = useState('');
  const [attributesForAi, setAttributesForAi] = useState('');

  // Обновление Description при выборе агента
  useEffect(() => {
    if (selectedAgentId) {
      const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);
      if (selectedAgent && selectedAgent.description) {
        setDescription(selectedAgent.description);
      }
    }
  }, [selectedAgentId, agents]);

  const handleCreateNewAgent = () => {
    const newId = Math.max(...agents.map((a) => a.id), 0) + 1;
    const newAgent = {
      id: newId,
      description: `New Agent ${newId}`,
      project: 'New Project',
    };
    setAgents((prev) => [...prev, newAgent]);
    setSelectedAgentId(newId);
  };

  const handleDeleteAgent = (agentId, e) => {
    e.stopPropagation();
    const agent = agents.find((a) => a.id === agentId);
    
    const backgroundColor = theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface;
    const textColor = theme.colors.primary;
    const buttonBg = theme.colors.primary;
    const buttonText = theme.colors.background;
    const cancelButtonBg = theme.colors.background;
    const cancelButtonText = theme.colors.primary;
    
    Confirm.show(
      'Удаление агента',
      `Вы уверены, что хотите удалить агента "${agent?.description || 'Unknown'}"?`,
      'Да',
      'Нет',
      () => {
        setAgents((prev) => prev.filter((a) => a.id !== agentId));
        if (selectedAgentId === agentId) {
          setSelectedAgentId(null);
        }
        Notify.success(`Агент "${agent?.description || 'Unknown'}" успешно удален`);
      },
      () => {
        // Отмена удаления
      },
      {
        width: '400px',
        borderRadius: '12px',
        backgroundColor: backgroundColor,
        titleColor: textColor,
        messageColor: textColor,
        buttonBackground: buttonBg,
        buttonColor: buttonText,
        cancelButtonBackground: cancelButtonBg,
        cancelButtonColor: cancelButtonText,
        backOverlayColor: 'rgba(0,0,0,0.5)',
        okButtonBackground: buttonBg,
        okButtonColor: buttonText,
        fontFamily: 'inherit',
        titleFontSize: '18px',
        messageFontSize: '14px',
        cssAnimationStyle: 'zoom',
      }
    );
  };
  const [instruction, setInstruction] = useState('');
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [toolCalling, setToolCalling] = useState('');
  const [toolDefinition, setToolDefinition] = useState('');
  const [useRewrite, setUseRewrite] = useState(false);
  const [temperature, setTemperature] = useState(0);
  const [topP, setTopP] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [chunksScore, setChunksScore] = useState(0);
  const [chunksLimit, setChunksLimit] = useState(0);
  const [selectedChunks, setSelectedChunks] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editLeftWidth, setEditLeftWidth] = useState(50);
  const [isEditResizing, setIsEditResizing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showChunksForMessage, setShowChunksForMessage] = useState(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isPlaygroundChunksModalOpen, setIsPlaygroundChunksModalOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const containerRef = useRef(null);
  const editContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      // Ограничения: минимальная ширина левой панели 400px, минимальная ширина правой панели 500px
      const minLeftWidth = 400;
      const minRightWidth = 550;
      const maxWidth = containerRect.width - minRightWidth - 1; // -1 для разделителя

      if (newWidth >= minLeftWidth && newWidth <= maxWidth) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  useEffect(() => {
    const handleEditMouseMove = (e) => {
      if (!isEditResizing) return;

      const container = editContainerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newLeftWidthPx = e.clientX - containerRect.left;
      const containerWidth = containerRect.width;

      // Минимальная ширина 500px, максимальная 80% от ширины контейнера
      const minWidthPx = 500;
      const maxWidthPx = containerWidth * 0.8;

      if (newLeftWidthPx >= minWidthPx && newLeftWidthPx <= maxWidthPx) {
        const newLeftWidthPercent = (newLeftWidthPx / containerWidth) * 100;
        setEditLeftWidth(newLeftWidthPercent);
      }
    };

    const handleEditMouseUp = () => {
      setIsEditResizing(false);
    };

    if (isEditResizing) {
      document.addEventListener('mousemove', handleEditMouseMove);
      document.addEventListener('mouseup', handleEditMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleEditMouseMove);
      document.removeEventListener('mouseup', handleEditMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isEditResizing]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = leftWidth;
  };

  const handleEditMouseDown = (e) => {
    e.preventDefault();
    setIsEditResizing(true);
  };

  const filteredTools = toolsList.filter((tool) => {
    const toolKey = `${tool.name}(${tool.id})`;
    return toolKey.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredChunks = chunksList.filter((chunk) => {
    return chunk.toLowerCase().includes(chunksSearchQuery.toLowerCase());
  });

  const handleToolToggle = (toolKey) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(toolKey)) {
      newSelected.delete(toolKey);
    } else {
      newSelected.add(toolKey);
    }
    setSelectedTools(newSelected);
  };

  const handleChunkToggle = (chunk) => {
    const newSelected = new Set(selectedChunks);
    if (newSelected.has(chunk)) {
      newSelected.delete(chunk);
    } else {
      newSelected.add(chunk);
    }
    setSelectedChunks(newSelected);
  };

  const handleTemperatureChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setTemperature(numValue);
  };

  const handleTemperatureIncrement = () => {
    setTemperature((prev) => {
      const newValue = prev + 0.1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleTemperatureDecrement = () => {
    setTemperature((prev) => {
      const newValue = prev - 0.1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleTemperatureIncrementByOne = () => {
    setTemperature((prev) => {
      const newValue = prev + 1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleTemperatureDecrementByOne = () => {
    setTemperature((prev) => {
      const newValue = prev - 1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleTopPChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setTopP(numValue);
  };

  const handleTopPIncrement = () => {
    setTopP((prev) => {
      const newValue = prev + 0.1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleTopPDecrement = () => {
    setTopP((prev) => {
      const newValue = prev - 0.1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleTopPIncrementByOne = () => {
    setTopP((prev) => {
      const newValue = prev + 1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleTopPDecrementByOne = () => {
    setTopP((prev) => {
      const newValue = prev - 1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleMaxTokensChange = (value) => {
    const numValue = parseInt(value) || 0;
    setMaxTokens(numValue);
  };

  const handleMaxTokensIncrement = () => {
    setMaxTokens((prev) => prev + 1);
  };

  const handleMaxTokensDecrement = () => {
    setMaxTokens((prev) => Math.max(0, prev - 1));
  };

  const handleMaxTokensIncrementByTen = () => {
    setMaxTokens((prev) => prev + 10);
  };

  const handleMaxTokensDecrementByTen = () => {
    setMaxTokens((prev) => Math.max(0, prev - 10));
  };

  const handleChunksScoreChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setChunksScore(numValue);
  };

  const handleChunksScoreIncrement = () => {
    setChunksScore((prev) => {
      const newValue = prev + 0.1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleChunksScoreDecrement = () => {
    setChunksScore((prev) => {
      const newValue = prev - 0.1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleChunksScoreIncrementByOne = () => {
    setChunksScore((prev) => {
      const newValue = prev + 1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleChunksScoreDecrementByOne = () => {
    setChunksScore((prev) => {
      const newValue = prev - 1;
      return Math.round(newValue * 10) / 10;
    });
  };

  const handleChunksLimitChange = (value) => {
    const numValue = parseInt(value) || 0;
    setChunksLimit(numValue);
  };

  const handleChunksLimitIncrement = () => {
    setChunksLimit((prev) => prev + 1);
  };

  const handleChunksLimitDecrement = () => {
    setChunksLimit((prev) => Math.max(0, prev - 1));
  };

  const handleChunksLimitIncrementByTen = () => {
    setChunksLimit((prev) => prev + 10);
  };

  const handleChunksLimitDecrementByTen = () => {
    setChunksLimit((prev) => Math.max(0, prev - 10));
  };

  const handleSave = () => {
    // Здесь будет логика сохранения данных
    console.log('Сохранение изменений...');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      role: 'user',
      text: inputMessage,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    // Симуляция ответа ассистента
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Для прохождения верификации необходимо предоставить копии документов, удостоверяющих личность. Обычно это паспорт или водительское удостоверение. Также может потребоваться подтверждение адреса проживания, например, счет за коммунальные услуги.\n\nВам необходимо загрузить сканы или фотографии документов в личном кабинете на сайте AUFcasino. Убедитесь, что все данные на документах четко видны.\n\nЕсли у Вас возникнут сложности с загрузкой документов, пожалуйста, сообщите мне, и я постараюсь Вам помочь. 🙏',
        hasChunksButton: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleShowChunks = (messageId) => {
    setShowChunksForMessage((prev) => (prev === messageId ? null : messageId));
    if (showChunksForMessage !== messageId) {
      setCurrentChunkIndex(0);
    }
  };

  const handleNextChunk = () => {
    setCurrentChunkIndex((prev) => (prev + 1) % chunksData.length);
  };

  const handlePrevChunk = () => {
    setCurrentChunkIndex((prev) => (prev - 1 + chunksData.length) % chunksData.length);
  };

  const handleOpenChunksModal = () => {
    setIsPlaygroundChunksModalOpen(true);
  };

  const chunksData = [
    {
      title: 'Верификация криптовалюты:',
      text: '- На данный момент при пополнении счёта с помощью криптовалюты верификация кошелька не требуется.\n- Если такая необходимость возникнет в будущем, мы обязательно уведомим вас дополнительно.',
    },
    {
      title: 'Верификация виртуальной карты альфабанк:',
      text: 'СИНОНИМЫ: виртуальные карты, как верифицировать виртуальную карту альфа банка?\n- Если клиент хочет верифицировать виртуальную карту Альфа банка необходимо предоставить следующий ответ "Вам необходимо загрузить подтверждение владения картой, содержащее ваши ФИО и последние 4 цифры номера карты. 💳 Для того, чтобы получить нужный документ зайдите, пожалуйста, в мобильное приложение Альфа-банка:\n1. В приложении банка на главной странице откройте раздел «Выписка»;\n2. Выберите любой вариант из предложенных: "Реквизиты счета", "Справка об остатке и движении средств", "Справка о наличии счетов";\n4. Чтобы сформировать выписку, нажмите на кнопку «Получить выписку». Выберите формат pdf и дополнительные параметры.\nЕсли у вас возникли проблемы на одном из пунктов, пожалуйста, обратитесь в поддержку вашего банка и запросите нужный документ. 🙏 "',
    },
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Layout>
      <PageContainer ref={containerRef}>
        <LeftPanel $width={leftWidth} $isHidden={isEditing} $isFullWidth={!selectedAgentId && !isEditing}>
          <HeaderSection theme={theme}>
            <Title theme={theme}>Local Assistants</Title>
            <ButtonsGroup>
              <Button theme={theme}>Export</Button>
              <Button theme={theme} $primary onClick={handleCreateNewAgent}>
                New Local Assistant
              </Button>
            </ButtonsGroup>
          </HeaderSection>
          <AgentsList>
            {agents.map((agent) => (
              <AgentBlock
                key={agent.id}
                theme={theme}
                $selected={selectedAgentId === agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <AgentInfo>
                  <AgentDescription theme={theme}>{agent.description}</AgentDescription>
                  <AgentId theme={theme}>id: {agent.id}</AgentId>
                </AgentInfo>
                <DeleteButton
                  theme={theme}
                  onClick={(e) => handleDeleteAgent(agent.id, e)}
                  title="Удалить агента"
                >
                  <HiTrash size={16} />
                </DeleteButton>
              </AgentBlock>
            ))}
          </AgentsList>
        </LeftPanel>

        <Divider theme={theme} $isHidden={isEditing || !selectedAgentId} onMouseDown={handleMouseDown} />

         {selectedAgentId && (
           <RightPanel>
             {!isEditing ? (
               <RightContent theme={theme}>
                <EditButton theme={theme} onClick={handleEditToggle}>
                  <HiPencil size={14} />
                  <span>Edit</span>
                </EditButton>
                <SettingsWrapper>
            <SettingSection>
              <SettingLabel theme={theme}>
                Tools
                <EditIconButton
                  theme={theme}
                  onClick={() => setIsModalOpen(true)}
                  title="Редактировать инструменты"
                >
                  <HiPencil size={14} />
                </EditIconButton>
              </SettingLabel>
              <SettingContent>
                <ToolsListContainer theme={theme}>
                  <ToolsList>
                    {toolsList.map((tool, index) => {
                      const toolKey = `${tool.name}(${tool.id})`;
                      return (
                        <ToolItem key={`${tool.id}-${index}`} theme={theme}>
                          <Checkbox
                            type="checkbox"
                            checked={selectedTools.has(toolKey)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedTools);
                              if (e.target.checked) {
                                newSelected.add(toolKey);
                              } else {
                                newSelected.delete(toolKey);
                              }
                              setSelectedTools(newSelected);
                            }}
                            theme={theme}
                          />
                          <ToolName>{toolKey}</ToolName>
                        </ToolItem>
                      );
                    })}
                  </ToolsList>
                </ToolsListContainer>
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Model
              </SettingLabel>
              <SettingContent>
                <Select
                  theme={theme}
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option value="">Выберите модель</option>
                  <option value="model1">Model 1</option>
                  <option value="model2">Model 2</option>
                  <option value="model3">Model 3</option>
                </Select>
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Chunks
                <EditIconButton
                  theme={theme}
                  onClick={() => setIsChunksModalOpen(true)}
                  title="Редактировать chunks"
                >
                  <HiPencil size={14} />
                </EditIconButton>
              </SettingLabel>
              <SettingContent>
                <ToolsListContainer theme={theme}>
                  <ToolsList>
                    {chunksList.map((chunk, index) => (
                      <ToolItem key={`chunk-${index}`} theme={theme}>
                        <Checkbox
                          type="checkbox"
                          checked={selectedChunks.has(chunk)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedChunks);
                            if (e.target.checked) {
                              newSelected.add(chunk);
                            } else {
                              newSelected.delete(chunk);
                            }
                            setSelectedChunks(newSelected);
                          }}
                          theme={theme}
                        />
                        <ToolName>{chunk}</ToolName>
                      </ToolItem>
                    ))}
                  </ToolsList>
                </ToolsListContainer>
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Localization
              </SettingLabel>
              <SettingContent>
                <Select
                  theme={theme}
                  value={selectedLocalization}
                  onChange={(e) => setSelectedLocalization(e.target.value)}
                >
                  <option value="">Выберите локализацию</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="uk">Українська</option>
                </Select>
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Description
                <EditIconButton
                  theme={theme}
                  onClick={() => setIsDescriptionModalOpen(true)}
                  title="Редактировать описание"
                >
                  <HiPencil size={14} />
                </EditIconButton>
              </SettingLabel>
              <SettingContent>
                <TextInput
                  theme={theme}
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Введите описание..."
                />
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Attributes For Ai
                <EditIconButton
                  theme={theme}
                  onClick={() => setIsAttributesModalOpen(true)}
                  title="Редактировать атрибуты"
                >
                  <HiPencil size={14} />
                </EditIconButton>
              </SettingLabel>
              <SettingContent>
                <TextInput
                  theme={theme}
                  type="text"
                  value={attributesForAi}
                  onChange={(e) => setAttributesForAi(e.target.value)}
                  placeholder="Введите атрибуты..."
                />
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Instruction
                <EditIconButton
                  theme={theme}
                  onClick={() => setIsInstructionModalOpen(true)}
                  title="Редактировать инструкцию"
                >
                  <HiPencil size={14} />
                </EditIconButton>
              </SettingLabel>
              <SettingContent>
                <TextInput
                  theme={theme}
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Введите инструкцию..."
                />
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Rewrite Instruction
                <EditIconButton
                  theme={theme}
                  onClick={() => setIsRewriteInstructionModalOpen(true)}
                  title="Редактировать rewrite instruction"
                >
                  <HiPencil size={14} />
                </EditIconButton>
              </SettingLabel>
              <SettingContent>
                <TextInput
                  theme={theme}
                  type="text"
                  value={rewriteInstruction}
                  onChange={(e) => setRewriteInstruction(e.target.value)}
                  placeholder="Введите rewrite instruction..."
                />
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Use Rewrite
              </SettingLabel>
              <SettingContent>
                <Checkbox
                  type="checkbox"
                  checked={useRewrite}
                  onChange={(e) => setUseRewrite(e.target.checked)}
                  theme={theme}
                />
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Temperature
              </SettingLabel>
              <SettingContent>
                <NumberInputContainer theme={theme}>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleTemperatureDecrementByOne}
                    title="Уменьшить на 1"
                    $isRight={false}
                  >
                    <HiChevronDoubleLeft size={16} />
                  </NumberInputButton>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleTemperatureDecrement}
                    title="Уменьшить на 0.1"
                    $isRight={false}
                  >
                    <HiChevronLeft size={16} />
                  </NumberInputButton>
                  <NumberInput
                    theme={theme}
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => handleTemperatureChange(e.target.value)}
                    placeholder="0.0"
                  />
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleTemperatureIncrement}
                    title="Увеличить на 0.1"
                    $isRight={true}
                  >
                    <HiChevronRight size={16} />
                  </NumberInputButton>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleTemperatureIncrementByOne}
                    title="Увеличить на 1"
                    $isRight={true}
                  >
                    <HiChevronDoubleRight size={16} />
                  </NumberInputButton>
                </NumberInputContainer>
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Top P
              </SettingLabel>
              <SettingContent>
                <NumberInputContainer theme={theme}>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleTopPDecrementByOne}
                    title="Уменьшить на 1"
                    $isRight={false}
                  >
                    <HiChevronDoubleLeft size={16} />
                  </NumberInputButton>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleTopPDecrement}
                    title="Уменьшить на 0.1"
                    $isRight={false}
                  >
                    <HiChevronLeft size={16} />
                  </NumberInputButton>
                  <NumberInput
                    theme={theme}
                    type="number"
                    step="0.1"
                    value={topP}
                    onChange={(e) => handleTopPChange(e.target.value)}
                    placeholder="0.0"
                  />
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleTopPIncrement}
                    title="Увеличить на 0.1"
                    $isRight={true}
                  >
                    <HiChevronRight size={16} />
                  </NumberInputButton>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleTopPIncrementByOne}
                    title="Увеличить на 1"
                    $isRight={true}
                  >
                    <HiChevronDoubleRight size={16} />
                  </NumberInputButton>
                </NumberInputContainer>
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Max Tokens
              </SettingLabel>
              <SettingContent>
                <NumberInputContainer theme={theme}>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleMaxTokensDecrementByTen}
                    title="Уменьшить на 10"
                    $isRight={false}
                  >
                    <HiChevronDoubleLeft size={16} />
                  </NumberInputButton>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleMaxTokensDecrement}
                    title="Уменьшить на 1"
                    $isRight={false}
                  >
                    <HiChevronLeft size={16} />
                  </NumberInputButton>
                  <NumberInput
                    theme={theme}
                    type="number"
                    step="1"
                    value={maxTokens}
                    onChange={(e) => handleMaxTokensChange(e.target.value)}
                    placeholder="0"
                  />
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleMaxTokensIncrement}
                    title="Увеличить на 1"
                    $isRight={true}
                  >
                    <HiChevronRight size={16} />
                  </NumberInputButton>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleMaxTokensIncrementByTen}
                    title="Увеличить на 10"
                    $isRight={true}
                  >
                    <HiChevronDoubleRight size={16} />
                  </NumberInputButton>
                </NumberInputContainer>
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Chunks Score
              </SettingLabel>
              <SettingContent>
                <NumberInputContainer theme={theme}>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleChunksScoreDecrementByOne}
                    title="Уменьшить на 1"
                    $isRight={false}
                  >
                    <HiChevronDoubleLeft size={16} />
                  </NumberInputButton>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleChunksScoreDecrement}
                    title="Уменьшить на 0.1"
                    $isRight={false}
                  >
                    <HiChevronLeft size={16} />
                  </NumberInputButton>
                  <NumberInput
                    theme={theme}
                    type="number"
                    step="0.1"
                    value={chunksScore}
                    onChange={(e) => handleChunksScoreChange(e.target.value)}
                    placeholder="0.0"
                  />
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleChunksScoreIncrement}
                    title="Увеличить на 0.1"
                    $isRight={true}
                  >
                    <HiChevronRight size={16} />
                  </NumberInputButton>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleChunksScoreIncrementByOne}
                    title="Увеличить на 1"
                    $isRight={true}
                  >
                    <HiChevronDoubleRight size={16} />
                  </NumberInputButton>
                </NumberInputContainer>
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Chunks Limit
              </SettingLabel>
              <SettingContent>
                <NumberInputContainer theme={theme}>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleChunksLimitDecrementByTen}
                    title="Уменьшить на 10"
                    $isRight={false}
                  >
                    <HiChevronDoubleLeft size={16} />
                  </NumberInputButton>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleChunksLimitDecrement}
                    title="Уменьшить на 1"
                    $isRight={false}
                  >
                    <HiChevronLeft size={16} />
                  </NumberInputButton>
                  <NumberInput
                    theme={theme}
                    type="number"
                    step="1"
                    value={chunksLimit}
                    onChange={(e) => handleChunksLimitChange(e.target.value)}
                    placeholder="0"
                  />
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleChunksLimitIncrement}
                    title="Увеличить на 1"
                    $isRight={true}
                  >
                    <HiChevronRight size={16} />
                  </NumberInputButton>
                  <NumberInputButton
                    theme={theme}
                    type="button"
                    onClick={handleChunksLimitIncrementByTen}
                    title="Увеличить на 10"
                    $isRight={true}
                  >
                    <HiChevronDoubleRight size={16} />
                  </NumberInputButton>
                </NumberInputContainer>
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Tool Calling
                <EditIconButton
                  theme={theme}
                  onClick={() => setIsToolCallingModalOpen(true)}
                  title="Редактировать tool calling"
                >
                  <HiPencil size={14} />
                </EditIconButton>
              </SettingLabel>
              <SettingContent>
                <TextInput
                  theme={theme}
                  type="text"
                  value={toolCalling}
                  onChange={(e) => setToolCalling(e.target.value)}
                  placeholder="Введите tool calling..."
                />
              </SettingContent>
            </SettingSection>

            <SettingSection>
              <SettingLabel theme={theme}>
                Tool Definition
                <EditIconButton
                  theme={theme}
                  onClick={() => setIsToolDefinitionModalOpen(true)}
                  title="Редактировать tool definition"
                >
                  <HiPencil size={14} />
                </EditIconButton>
              </SettingLabel>
              <SettingContent>
                <TextInput
                  theme={theme}
                  type="text"
                  value={toolDefinition}
                  onChange={(e) => setToolDefinition(e.target.value)}
                  placeholder="Введите tool definition..."
                />
              </SettingContent>
            </SettingSection>
            </SettingsWrapper>

            <SaveButton theme={theme} onClick={handleSave}>
              Сохранить изменения
            </SaveButton>
           </RightContent>
           ) : (
             <EditModeContainer ref={editContainerRef}>
               <SettingsPanel theme={theme} $width={editLeftWidth}>
                 <RightContent theme={theme}>
                   <EditButton theme={theme} $isBack onClick={handleEditToggle}>
                     <span>← Back</span>
                   </EditButton>
                   <SettingsWrapper>
                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Tools
                         <EditIconButton
                           theme={theme}
                           onClick={() => setIsModalOpen(true)}
                           title="Редактировать инструменты"
                         >
                           <HiPencil size={14} />
                         </EditIconButton>
                       </SettingLabel>
                       <SettingContent>
                         <ToolsListContainer theme={theme}>
                           <ToolsList>
                             {toolsList.map((tool, index) => {
                               const toolKey = `${tool.name}(${tool.id})`;
                               return (
                                 <ToolItem key={`${tool.id}-${index}`} theme={theme}>
                                   <Checkbox
                                     type="checkbox"
                                     checked={selectedTools.has(toolKey)}
                                     onChange={(e) => {
                                       const newSelected = new Set(selectedTools);
                                       if (e.target.checked) {
                                         newSelected.add(toolKey);
                                       } else {
                                         newSelected.delete(toolKey);
                                       }
                                       setSelectedTools(newSelected);
                                     }}
                                     theme={theme}
                                   />
                                   <ToolName>{toolKey}</ToolName>
                                 </ToolItem>
                               );
                             })}
                           </ToolsList>
                         </ToolsListContainer>
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Model
                       </SettingLabel>
                       <SettingContent>
                         <Select
                           theme={theme}
                           value={selectedModel}
                           onChange={(e) => setSelectedModel(e.target.value)}
                         >
                           <option value="">Выберите модель</option>
                           <option value="model1">Model 1</option>
                           <option value="model2">Model 2</option>
                           <option value="model3">Model 3</option>
                         </Select>
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Chunks
                         <EditIconButton
                           theme={theme}
                           onClick={() => setIsChunksModalOpen(true)}
                           title="Редактировать chunks"
                         >
                           <HiPencil size={14} />
                         </EditIconButton>
                       </SettingLabel>
                       <SettingContent>
                         <ToolsListContainer theme={theme}>
                           <ToolsList>
                             {chunksList.map((chunk, index) => (
                               <ToolItem key={`chunk-${index}`} theme={theme}>
                                 <Checkbox
                                   type="checkbox"
                                   checked={selectedChunks.has(chunk)}
                                   onChange={(e) => {
                                     const newSelected = new Set(selectedChunks);
                                     if (e.target.checked) {
                                       newSelected.add(chunk);
                                     } else {
                                       newSelected.delete(chunk);
                                     }
                                     setSelectedChunks(newSelected);
                                   }}
                                   theme={theme}
                                 />
                                 <ToolName>{chunk}</ToolName>
                               </ToolItem>
                             ))}
                           </ToolsList>
                         </ToolsListContainer>
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Localization
                       </SettingLabel>
                       <SettingContent>
                         <Select
                           theme={theme}
                           value={selectedLocalization}
                           onChange={(e) => setSelectedLocalization(e.target.value)}
                         >
                           <option value="">Выберите локализацию</option>
                           <option value="en">English</option>
                           <option value="ru">Русский</option>
                           <option value="uk">Українська</option>
                         </Select>
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Description
                         <EditIconButton
                           theme={theme}
                           onClick={() => setIsDescriptionModalOpen(true)}
                           title="Редактировать описание"
                         >
                           <HiPencil size={14} />
                         </EditIconButton>
                       </SettingLabel>
                       <SettingContent>
                         <TextInput
                           theme={theme}
                           type="text"
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                           placeholder="Введите описание..."
                         />
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Attributes For Ai
                         <EditIconButton
                           theme={theme}
                           onClick={() => setIsAttributesModalOpen(true)}
                           title="Редактировать атрибуты"
                         >
                           <HiPencil size={14} />
                         </EditIconButton>
                       </SettingLabel>
                       <SettingContent>
                         <TextInput
                           theme={theme}
                           type="text"
                           value={attributesForAi}
                           onChange={(e) => setAttributesForAi(e.target.value)}
                           placeholder="Введите атрибуты..."
                         />
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Instruction
                         <EditIconButton
                           theme={theme}
                           onClick={() => setIsInstructionModalOpen(true)}
                           title="Редактировать инструкцию"
                         >
                           <HiPencil size={14} />
                         </EditIconButton>
                       </SettingLabel>
                       <SettingContent>
                         <TextInput
                           theme={theme}
                           type="text"
                           value={instruction}
                           onChange={(e) => setInstruction(e.target.value)}
                           placeholder="Введите инструкцию..."
                         />
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Rewrite Instruction
                         <EditIconButton
                           theme={theme}
                           onClick={() => setIsRewriteInstructionModalOpen(true)}
                           title="Редактировать rewrite instruction"
                         >
                           <HiPencil size={14} />
                         </EditIconButton>
                       </SettingLabel>
                       <SettingContent>
                         <TextInput
                           theme={theme}
                           type="text"
                           value={rewriteInstruction}
                           onChange={(e) => setRewriteInstruction(e.target.value)}
                           placeholder="Введите rewrite instruction..."
                         />
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Use Rewrite
                       </SettingLabel>
                       <SettingContent>
                         <Checkbox
                           type="checkbox"
                           checked={useRewrite}
                           onChange={(e) => setUseRewrite(e.target.checked)}
                           theme={theme}
                         />
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Temperature
                       </SettingLabel>
                       <SettingContent>
                         <NumberInputContainer theme={theme}>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleTemperatureDecrementByOne}
                             title="Уменьшить на 1"
                             $isRight={false}
                           >
                             <HiChevronDoubleLeft size={16} />
                           </NumberInputButton>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleTemperatureDecrement}
                             title="Уменьшить на 0.1"
                             $isRight={false}
                           >
                             <HiChevronLeft size={16} />
                           </NumberInputButton>
                           <NumberInput
                             theme={theme}
                             type="number"
                             step="0.1"
                             value={temperature}
                             onChange={(e) => handleTemperatureChange(e.target.value)}
                             placeholder="0.0"
                           />
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleTemperatureIncrement}
                             title="Увеличить на 0.1"
                             $isRight={true}
                           >
                             <HiChevronRight size={16} />
                           </NumberInputButton>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleTemperatureIncrementByOne}
                             title="Увеличить на 1"
                             $isRight={true}
                           >
                             <HiChevronDoubleRight size={16} />
                           </NumberInputButton>
                         </NumberInputContainer>
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Top P
                       </SettingLabel>
                       <SettingContent>
                         <NumberInputContainer theme={theme}>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleTopPDecrementByOne}
                             title="Уменьшить на 1"
                             $isRight={false}
                           >
                             <HiChevronDoubleLeft size={16} />
                           </NumberInputButton>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleTopPDecrement}
                             title="Уменьшить на 0.1"
                             $isRight={false}
                           >
                             <HiChevronLeft size={16} />
                           </NumberInputButton>
                           <NumberInput
                             theme={theme}
                             type="number"
                             step="0.1"
                             value={topP}
                             onChange={(e) => handleTopPChange(e.target.value)}
                             placeholder="0.0"
                           />
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleTopPIncrement}
                             title="Увеличить на 0.1"
                             $isRight={true}
                           >
                             <HiChevronRight size={16} />
                           </NumberInputButton>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleTopPIncrementByOne}
                             title="Увеличить на 1"
                             $isRight={true}
                           >
                             <HiChevronDoubleRight size={16} />
                           </NumberInputButton>
                         </NumberInputContainer>
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Max Tokens
                       </SettingLabel>
                       <SettingContent>
                         <NumberInputContainer theme={theme}>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleMaxTokensDecrementByTen}
                             title="Уменьшить на 10"
                             $isRight={false}
                           >
                             <HiChevronDoubleLeft size={16} />
                           </NumberInputButton>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleMaxTokensDecrement}
                             title="Уменьшить на 1"
                             $isRight={false}
                           >
                             <HiChevronLeft size={16} />
                           </NumberInputButton>
                           <NumberInput
                             theme={theme}
                             type="number"
                             step="1"
                             value={maxTokens}
                             onChange={(e) => handleMaxTokensChange(e.target.value)}
                             placeholder="0"
                           />
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleMaxTokensIncrement}
                             title="Увеличить на 1"
                             $isRight={true}
                           >
                             <HiChevronRight size={16} />
                           </NumberInputButton>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleMaxTokensIncrementByTen}
                             title="Увеличить на 10"
                             $isRight={true}
                           >
                             <HiChevronDoubleRight size={16} />
                           </NumberInputButton>
                         </NumberInputContainer>
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Chunks Score
                       </SettingLabel>
                       <SettingContent>
                         <NumberInputContainer theme={theme}>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleChunksScoreDecrementByOne}
                             title="Уменьшить на 1"
                             $isRight={false}
                           >
                             <HiChevronDoubleLeft size={16} />
                           </NumberInputButton>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleChunksScoreDecrement}
                             title="Уменьшить на 0.1"
                             $isRight={false}
                           >
                             <HiChevronLeft size={16} />
                           </NumberInputButton>
                           <NumberInput
                             theme={theme}
                             type="number"
                             step="0.1"
                             value={chunksScore}
                             onChange={(e) => handleChunksScoreChange(e.target.value)}
                             placeholder="0.0"
                           />
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleChunksScoreIncrement}
                             title="Увеличить на 0.1"
                             $isRight={true}
                           >
                             <HiChevronRight size={16} />
                           </NumberInputButton>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleChunksScoreIncrementByOne}
                             title="Увеличить на 1"
                             $isRight={true}
                           >
                             <HiChevronDoubleRight size={16} />
                           </NumberInputButton>
                         </NumberInputContainer>
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Chunks Limit
                       </SettingLabel>
                       <SettingContent>
                         <NumberInputContainer theme={theme}>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleChunksLimitDecrementByTen}
                             title="Уменьшить на 10"
                             $isRight={false}
                           >
                             <HiChevronDoubleLeft size={16} />
                           </NumberInputButton>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleChunksLimitDecrement}
                             title="Уменьшить на 1"
                             $isRight={false}
                           >
                             <HiChevronLeft size={16} />
                           </NumberInputButton>
                           <NumberInput
                             theme={theme}
                             type="number"
                             step="1"
                             value={chunksLimit}
                             onChange={(e) => handleChunksLimitChange(e.target.value)}
                             placeholder="0"
                           />
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleChunksLimitIncrement}
                             title="Увеличить на 1"
                             $isRight={true}
                           >
                             <HiChevronRight size={16} />
                           </NumberInputButton>
                           <NumberInputButton
                             theme={theme}
                             type="button"
                             onClick={handleChunksLimitIncrementByTen}
                             title="Увеличить на 10"
                             $isRight={true}
                           >
                             <HiChevronDoubleRight size={16} />
                           </NumberInputButton>
                         </NumberInputContainer>
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Tool Calling
                         <EditIconButton
                           theme={theme}
                           onClick={() => setIsToolCallingModalOpen(true)}
                           title="Редактировать tool calling"
                         >
                           <HiPencil size={14} />
                         </EditIconButton>
                       </SettingLabel>
                       <SettingContent>
                         <TextInput
                           theme={theme}
                           type="text"
                           value={toolCalling}
                           onChange={(e) => setToolCalling(e.target.value)}
                           placeholder="Введите tool calling..."
                         />
                       </SettingContent>
                     </SettingSection>

                     <SettingSection>
                       <SettingLabel theme={theme}>
                         Tool Definition
                         <EditIconButton
                           theme={theme}
                           onClick={() => setIsToolDefinitionModalOpen(true)}
                           title="Редактировать tool definition"
                         >
                           <HiPencil size={14} />
                         </EditIconButton>
                       </SettingLabel>
                       <SettingContent>
                         <TextInput
                           theme={theme}
                           type="text"
                           value={toolDefinition}
                           onChange={(e) => setToolDefinition(e.target.value)}
                           placeholder="Введите tool definition..."
                         />
                       </SettingContent>
                     </SettingSection>

                     <SaveButton theme={theme} onClick={handleSave}>
                       Сохранить изменения
                     </SaveButton>
                   </SettingsWrapper>
                 </RightContent>
               </SettingsPanel>
               <EditDivider theme={theme} onMouseDown={handleEditMouseDown} />
               <NewRightPanel theme={theme} $width={100 - editLeftWidth}>
                 <PlaygroundContainer theme={theme}>
                   <PlaygroundHeader theme={theme}>
                     <PlaygroundTitle theme={theme}>Playground</PlaygroundTitle>
                   </PlaygroundHeader>
                  <MessagesContainer theme={theme}>
                    {messages.length > 0 && messages.map((message) => (
                         <Message key={message.id} $isUser={message.role === 'user'} theme={theme}>
                           <MessageRole theme={theme}>
                             {message.role === 'user' ? 'Вы' : 'Ассистент'}
                             {message.hasChunksButton && (
                               <>
                                 <ChunksButton theme={theme} onClick={() => handleShowChunks(message.id)}>
                                   <HiDocumentText size={14} />
                                   Knowledgebase
                                 </ChunksButton>
                                 <ChunksButton theme={theme} onClick={handleOpenChunksModal}>
                                   <HiPencil size={14} />
                                   Chunks
                                 </ChunksButton>
                               </>
                             )}
                           </MessageRole>
                           {message.hasChunksButton && showChunksForMessage === message.id && (
                             <ChunksContainer theme={theme}>
                               <ChunkNavigationButton
                                 theme={theme}
                                 onClick={handlePrevChunk}
                                 disabled={chunksData.length <= 1}
                               >
                                 <HiChevronLeft size={18} />
                               </ChunkNavigationButton>
                               <ChunkBlock theme={theme}>
                                 <ChunkTitle theme={theme}>
                                   {chunksData[currentChunkIndex]?.title}
                                 </ChunkTitle>
                                 <ChunkText theme={theme}>
                                   {chunksData[currentChunkIndex]?.text}
                                 </ChunkText>
                               </ChunkBlock>
                               <ChunkNavigationButton
                                 theme={theme}
                                 onClick={handleNextChunk}
                                 disabled={chunksData.length <= 1}
                               >
                                 <HiChevronRight size={18} />
                               </ChunkNavigationButton>
                             </ChunksContainer>
                           )}
                           <MessageText theme={theme}>
                             {message.text}
                           </MessageText>
                         </Message>
                       ))}
                     <div ref={messagesEndRef} />
                   </MessagesContainer>
                   <InputContainer theme={theme}>
                     <MessageInput
                       theme={theme}
                       type="text"
                       placeholder="Введите сообщение..."
                       value={inputMessage}
                       onChange={(e) => setInputMessage(e.target.value)}
                       onKeyPress={handleKeyPress}
                     />
                     <SendButton theme={theme} onClick={handleSendMessage}>
                       Отправить
                     </SendButton>
                   </InputContainer>
                 </PlaygroundContainer>
               </NewRightPanel>
              </EditModeContainer>
             )}
           </RightPanel>
         )}
      </PageContainer>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>Выберите инструменты</ModalTitle>
              <CloseButton theme={theme} onClick={() => setIsModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody theme={theme}>
              <SearchInput
                theme={theme}
                type="text"
                placeholder="Поиск инструментов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <ModalToolsList>
                {filteredTools.map((tool, index) => {
                  const toolKey = `${tool.name}(${tool.id})`;
                  return (
                    <ToolItem key={`${tool.id}-${index}`} theme={theme}>
                      <Checkbox
                        type="checkbox"
                        checked={selectedTools.has(toolKey)}
                        onChange={() => handleToolToggle(toolKey)}
                        theme={theme}
                      />
                      <ToolName>{toolKey}</ToolName>
                    </ToolItem>
                  );
                })}
              </ModalToolsList>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {isChunksModalOpen && (
        <ModalOverlay onClick={() => setIsChunksModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>Выберите chunks</ModalTitle>
              <CloseButton theme={theme} onClick={() => setIsChunksModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody theme={theme}>
              <SearchInput
                theme={theme}
                type="text"
                placeholder="Поиск chunks..."
                value={chunksSearchQuery}
                onChange={(e) => setChunksSearchQuery(e.target.value)}
              />
              <ModalToolsList>
                {filteredChunks.map((chunk, index) => (
                  <ToolItem key={`chunk-${index}`} theme={theme}>
                    <Checkbox
                      type="checkbox"
                      checked={selectedChunks.has(chunk)}
                      onChange={() => handleChunkToggle(chunk)}
                      theme={theme}
                    />
                    <ToolName>{chunk}</ToolName>
                  </ToolItem>
                ))}
              </ModalToolsList>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {isDescriptionModalOpen && (
        <ModalOverlay onClick={() => setIsDescriptionModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>Описание</ModalTitle>
              <CloseButton theme={theme} onClick={() => setIsDescriptionModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody theme={theme}>
              <ModalTextArea
                theme={theme}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Введите описание..."
              />
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {isAttributesModalOpen && (
        <ModalOverlay onClick={() => setIsAttributesModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>Attributes For Ai</ModalTitle>
              <CloseButton theme={theme} onClick={() => setIsAttributesModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody theme={theme}>
              <ModalTextArea
                theme={theme}
                value={attributesForAi}
                onChange={(e) => setAttributesForAi(e.target.value)}
                placeholder="Введите атрибуты..."
              />
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {isInstructionModalOpen && (
        <ModalOverlay onClick={() => setIsInstructionModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>Instruction</ModalTitle>
              <CloseButton theme={theme} onClick={() => setIsInstructionModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody theme={theme}>
              <ModalTextArea
                theme={theme}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Введите инструкцию..."
              />
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {isRewriteInstructionModalOpen && (
        <ModalOverlay onClick={() => setIsRewriteInstructionModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>Rewrite Instruction</ModalTitle>
              <CloseButton theme={theme} onClick={() => setIsRewriteInstructionModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody theme={theme}>
              <ModalTextArea
                theme={theme}
                value={rewriteInstruction}
                onChange={(e) => setRewriteInstruction(e.target.value)}
                placeholder="Введите rewrite instruction..."
              />
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {isToolCallingModalOpen && (
        <ModalOverlay onClick={() => setIsToolCallingModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>Tool Calling</ModalTitle>
              <CloseButton theme={theme} onClick={() => setIsToolCallingModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody theme={theme}>
              <ModalTextArea
                theme={theme}
                value={toolCalling}
                onChange={(e) => setToolCalling(e.target.value)}
                placeholder="Введите tool calling..."
              />
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {isToolDefinitionModalOpen && (
        <ModalOverlay onClick={() => setIsToolDefinitionModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>Tool Definition</ModalTitle>
              <CloseButton theme={theme} onClick={() => setIsToolDefinitionModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody theme={theme}>
              <ModalTextArea
                theme={theme}
                value={toolDefinition}
                onChange={(e) => setToolDefinition(e.target.value)}
                placeholder="Введите tool definition..."
              />
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
      {isPlaygroundChunksModalOpen && (
        <ModalOverlay onClick={() => setIsPlaygroundChunksModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>Chunks</ModalTitle>
              <CloseButton theme={theme} onClick={() => setIsPlaygroundChunksModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody theme={theme}>
              {/* Здесь будет содержимое модального окна */}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Layout>
  );
};
