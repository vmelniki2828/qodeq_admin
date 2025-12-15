import { useState, useRef, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { Layout } from 'components/Layout';
import { HiPencil, HiTrash, HiArrowUp, HiArrowDown, HiChevronLeft } from 'react-icons/hi2';

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

const FiltersSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  gap: 16px;
  align-items: center;
  flex-shrink: 0;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

const SearchInput = styled.input`
  flex: 1;
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
  max-width: 400px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const PageContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  min-height: 0;
  overflow: hidden;
  height: 100%;
`;

const LeftPanel = styled.div`
  width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : '50%')};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Divider = styled.div`
  width: ${({ $isHidden }) => ($isHidden ? '0' : '1px')};
  background-color: ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  position: relative;
  opacity: ${({ $isHidden }) => ($isHidden ? 0 : 1)};
  pointer-events: ${({ $isHidden }) => ($isHidden ? 'none' : 'auto')};
  overflow: hidden;
`;

const RightPanel = styled.div`
  width: ${({ $isVisible }) => ($isVisible ? '50%' : '0')};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) =>
    theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};
`;

const TableHeader = styled.thead`
  background-color: ${({ theme }) =>
    theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: center;
  vertical-align: middle;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${({ theme }) =>
    theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
  position: relative;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f8f8f8' : 'rgba(255,255,255,0.04)'};
  }

  ${({ $sorted }) =>
    $sorted &&
    `
    color: ${({ theme }) => theme.colors.primary};
  `}

  ${({ $width }) =>
    $width &&
    `
    width: ${$width};
  `}
`;

const SortIcon = styled.span`
  margin-left: 8px;
  font-size: 10px;
  opacity: 0.6;
`;

const TableBody = styled.tbody`
  /* Styled component placeholder */
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f8f8f8' : 'rgba(255,255,255,0.04)'};
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  vertical-align: middle;
`;

const IdCell = styled(TableCell)`
  width: 80px;
  font-weight: 500;
`;

const ProjectCell = styled(TableCell)`
  width: 150px;
`;

const ProjectName = styled.span`
  color: ${({ theme }) => theme.colors.accent || '#2563eb'};
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease;
  font-size: 12px;

  &:hover {
    color: ${({ theme }) => theme.colors.accentHover || '#1d4ed8'};
    text-decoration: underline;
  }
`;

const TitleCell = styled(TableCell)`
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1.5;
`;

const ActionsCell = styled(TableCell)`
  width: 120px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
    color: ${({ theme }) => theme.colors.primary};
  }

  ${({ $danger }) =>
    $danger &&
    `
    &:hover {
      color: #ef4444;
      background-color: rgba(239,68,68,0.1);
    }
  `}
`;

// Моковые данные для Text Chunks
const mockTextChunks = [
  { id: 46, assistantId: 1, title: 'Нет отдачи, ничего не играет, ничего не играет, нет отдачи в слотах.' },
  { id: 48, assistantId: 2, title: 'Лимиты и Ограничения' },
  { id: 49, assistantId: 1, title: 'Верификация виртуальных карт сбер' },
  { id: 54, assistantId: 3, title: 'Перенос ВИП-аккаунта' },
  { id: 55, assistantId: 1, title: 'Завис выигрыш, не зачислился выигрыш в слоте/в игре' },
  { id: 57, assistantId: 2, title: 'Ненормативная лексика' },
  { id: 59, assistantId: 1, title: 'ТГ' },
  { id: 61, assistantId: 3, title: 'Верификация виртуальных карт тбанк' },
  { id: 63, assistantId: 5, title: 'Депозит крипта' },
  { id: 64, assistantId: 2, title: 'Вывод крипта' },
];

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

const BackButton = styled.button`
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
  align-self: flex-start;
  margin-bottom: 20px;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
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

const SettingContent = styled.div`
  flex: 1;
  min-width: 0;
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
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  border-radius: 6px;
  font-size: 24px;
  line-height: 1;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
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

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const ProjectDropdown = styled.div`
  position: relative;
  min-width: 200px;
`;

const ProjectSelectButton = styled.button`
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
  text-align: left;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProjectDropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};

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

const ProjectOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
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

const ProjectCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

export const TextChunksPage = () => {
  const { theme } = useTheme();
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [chunkTitle, setChunkTitle] = useState('');
  const [chunkText, setChunkText] = useState('');
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [editingChunkId, setEditingChunkId] = useState(null);
  const [chunks, setChunks] = useState(mockTextChunks);

  // Моковые данные ассистентов (из Local Assistants)
  const mockAssistants = [
    { id: 1, description: 'Cat', project: 'Project Alpha' },
    { id: 2, description: 'Gama', project: 'Project Beta' },
    { id: 3, description: 'Daddy', project: 'Project Gamma' },
    { id: 5, description: 'Kent', project: 'Project Alpha' },
    { id: 6, description: 'R7', project: 'Project Beta' },
    { id: 7, description: 'Kometa', project: 'Project Delta' },
    { id: 8, description: 'Arkada', project: 'Project Gamma' },
    { id: 9, description: 'Motor', project: 'Project Alpha' },
  ];

  // Получаем уникальные названия ассистентов для фильтрации
  const getAssistantName = (assistantId) => {
    const assistant = mockAssistants.find((a) => a.id === Number(assistantId));
    return assistant ? assistant.description : '';
  };

  const uniqueAssistants = [...new Set(chunks.map((chunk) => chunk.assistantId))].map((id) => {
    const assistant = mockAssistants.find((a) => a.id === id);
    return assistant ? assistant.description : '';
  }).filter(Boolean);

  const filteredChunks = chunks.filter((chunk) => {
    const assistantName = getAssistantName(chunk.assistantId);
    const matchesAssistant = selectedProjects.size === 0 || selectedProjects.has(assistantName);
    const matchesSearch = !searchQuery || chunk.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAssistant && matchesSearch;
  });

  const sortedChunks = [...filteredChunks].sort((a, b) => {
    if (!sortField) return 0;

    let aValue, bValue;

    switch (sortField) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'project':
        aValue = getAssistantName(a.assistantId);
        bValue = getAssistantName(b.assistantId);
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <HiArrowUp /> : <HiArrowDown />;
  };

  const handleProjectToggle = (projectName) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectName)) {
      newSelected.delete(projectName);
    } else {
      newSelected.add(projectName);
    }
    setSelectedProjects(newSelected);
  };

  const getProjectButtonText = () => {
    if (selectedProjects.size === 0) {
      return 'All Projects';
    }
    if (selectedProjects.size === 1) {
      return Array.from(selectedProjects)[0];
    }
    return `${selectedProjects.size} projects selected`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target)
      ) {
        setIsProjectDropdownOpen(false);
      }
    };

    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProjectDropdownOpen]);

  const handleNewTextChunk = () => {
    setEditingChunkId(null);
    setSelectedAssistant('');
    setChunkTitle('');
    setChunkText('');
    setIsActive(false);
    setIsSettingsOpen(true);
  };

  const handleEdit = (chunkId, e) => {
    e.stopPropagation();
    const chunk = chunks.find((c) => c.id === chunkId);
    if (chunk) {
      setEditingChunkId(chunkId);
      setSelectedAssistant(chunk.assistantId ? String(chunk.assistantId) : '');
      setChunkTitle(chunk.title || '');
      setChunkText(chunk.text || '');
      setIsActive(chunk.isActive || false);
      setIsSettingsOpen(true);
    }
  };

  const handleDelete = (chunkId, e) => {
    e.stopPropagation();
    setChunks((prevChunks) => prevChunks.filter((chunk) => chunk.id !== chunkId));
    console.log('Delete chunk:', chunkId);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    setEditingChunkId(null);
    setSelectedAssistant('');
    setChunkTitle('');
    setChunkText('');
    setIsActive(false);
  };

  const handleSave = () => {
    if (editingChunkId) {
      // Обновление существующего чанка
      setChunks((prevChunks) =>
        prevChunks.map((chunk) =>
          chunk.id === editingChunkId
            ? {
                ...chunk,
                assistantId: selectedAssistant ? Number(selectedAssistant) : null,
                title: chunkTitle,
                text: chunkText,
                isActive: isActive,
              }
            : chunk
        )
      );
      console.log('Update chunk:', editingChunkId, { 
        assistant: selectedAssistant, 
        title: chunkTitle,
        text: chunkText,
        isActive: isActive
      });
    } else {
      // Создание нового чанка
      const newId = Math.max(...chunks.map((c) => c.id), 0) + 1;
      const newChunk = {
        id: newId,
        assistantId: selectedAssistant ? Number(selectedAssistant) : null,
        title: chunkTitle,
        text: chunkText,
        isActive: isActive,
      };
      setChunks((prevChunks) => [...prevChunks, newChunk]);
      console.log('Create new chunk:', newChunk);
    }
    handleCloseSettings();
  };



  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <HeaderSection>
            <Title>Text Chunks</Title>
            <ButtonsGroup>
              <Button>Export</Button>
              <Button $primary onClick={handleNewTextChunk}>
                New Text Chunk
              </Button>
            </ButtonsGroup>
          </HeaderSection>

          <FiltersSection>
            <FilterLabel>Assistant:</FilterLabel>
            <ProjectDropdown ref={projectDropdownRef}>
              <ProjectSelectButton
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              >
                {getProjectButtonText()}
              </ProjectSelectButton>
              <ProjectDropdownMenu $isOpen={isProjectDropdownOpen}>
                {uniqueAssistants.map((assistant) => (
                  <ProjectOption key={assistant}>
                    <ProjectCheckbox
                      type="checkbox"
                      checked={selectedProjects.has(assistant)}
                      onChange={() => handleProjectToggle(assistant)}
                    />
                    <span>{assistant}</span>
                  </ProjectOption>
                ))}
              </ProjectDropdownMenu>
            </ProjectDropdown>
            <FilterLabel>Search:</FilterLabel>
            <SearchInput
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FiltersSection>

          <PageContainer>
            <LeftPanel $isFullWidth={!isSettingsOpen}>
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableHeaderRow>
                      <TableHeaderCell
                        onClick={() => handleSort('id')}
                        $sorted={sortField === 'id'}
                        $width="80px"
                      >
                        ID
                        <SortIcon>{getSortIcon('id')}</SortIcon>
                      </TableHeaderCell>
                      <TableHeaderCell
                        onClick={() => handleSort('project')}
                        $sorted={sortField === 'project'}
                        $width="150px"
                      >
                        Assistant
                        <SortIcon>{getSortIcon('project')}</SortIcon>
                      </TableHeaderCell>
                      <TableHeaderCell
                        onClick={() => handleSort('title')}
                        $sorted={sortField === 'title'}
                      >
                        Title
                        <SortIcon>{getSortIcon('title')}</SortIcon>
                      </TableHeaderCell>
                      <TableHeaderCell $width="120px">Actions</TableHeaderCell>
                    </TableHeaderRow>
                  </TableHeader>
                  <TableBody>
                    {sortedChunks.map((chunk) => (
                      <TableRow key={chunk.id}>
                        <IdCell>{chunk.id}</IdCell>
                        <ProjectCell>
                          <ProjectName>{getAssistantName(chunk.assistantId)}</ProjectName>
                        </ProjectCell>
                        <TitleCell>{chunk.title}</TitleCell>
                        <ActionsCell>
                          <ActionButton onClick={(e) => handleEdit(chunk.id, e)} title="Edit">
                            <HiPencil size={16} />
                          </ActionButton>
                          <ActionButton
                            $danger
                            onClick={(e) => handleDelete(chunk.id, e)}
                            title="Delete"
                          >
                            <HiTrash size={16} />
                          </ActionButton>
                        </ActionsCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </LeftPanel>

            <Divider
              $isHidden={!isSettingsOpen}
              theme={theme}
            />

            <RightPanel $isVisible={isSettingsOpen} theme={theme}>
              <RightContent theme={theme}>
                <BackButton onClick={handleCloseSettings} theme={theme}>
                  <HiChevronLeft size={16} />
                  Back
                </BackButton>

                <SettingSection>
                  <SettingLabel theme={theme}>Assistant</SettingLabel>
                  <SettingContent>
                    <Select
                      theme={theme}
                      value={selectedAssistant}
                      onChange={(e) => setSelectedAssistant(e.target.value)}
                    >
                      <option value="">Select assistant</option>
                      {mockAssistants.map((assistant) => (
                        <option key={assistant.id} value={assistant.id}>
                          {assistant.description} (id: {assistant.id})
                        </option>
                      ))}
                    </Select>
                  </SettingContent>
                </SettingSection>

                <SettingSection>
                  <SettingLabel theme={theme}>
                    Text
                    <EditIconButton
                      theme={theme}
                      onClick={() => setIsTextModalOpen(true)}
                      title="Редактировать текст"
                    >
                      <HiPencil size={14} />
                    </EditIconButton>
                  </SettingLabel>
                  <SettingContent>
                    <TextInput
                      theme={theme}
                      type="text"
                      value={chunkText}
                      onChange={(e) => setChunkText(e.target.value)}
                      placeholder="Введите текст..."
                    />
                  </SettingContent>
                </SettingSection>

                <SettingSection>
                  <SettingLabel theme={theme}>
                    Is Active
                  </SettingLabel>
                  <SettingContent>
                    <Checkbox
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      theme={theme}
                    />
                  </SettingContent>
                </SettingSection>

                <SettingSection>
                  <SettingLabel theme={theme}>
                    Title
                    <EditIconButton
                      theme={theme}
                      onClick={() => setIsTitleModalOpen(true)}
                      title="Редактировать заголовок"
                    >
                      <HiPencil size={14} />
                    </EditIconButton>
                  </SettingLabel>
                  <SettingContent>
                    <TextInput
                      theme={theme}
                      type="text"
                      value={chunkTitle}
                      onChange={(e) => setChunkTitle(e.target.value)}
                      placeholder="Введите заголовок..."
                    />
                  </SettingContent>
                </SettingSection>

                <SaveButton theme={theme} onClick={handleSave}>
                  Сохранить изменения
                </SaveButton>
              </RightContent>
            </RightPanel>
          </PageContainer>

          {isTextModalOpen && (
            <ModalOverlay onClick={() => setIsTextModalOpen(false)}>
              <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
                <ModalHeader theme={theme}>
                  <ModalTitle theme={theme}>Text</ModalTitle>
                  <CloseButton theme={theme} onClick={() => setIsTextModalOpen(false)}>
                    ×
                  </CloseButton>
                </ModalHeader>
                <ModalBody theme={theme}>
                  <ModalTextArea
                    theme={theme}
                    value={chunkText}
                    onChange={(e) => setChunkText(e.target.value)}
                    placeholder="Введите текст..."
                  />
                </ModalBody>
              </ModalContent>
            </ModalOverlay>
          )}

          {isTitleModalOpen && (
            <ModalOverlay onClick={() => setIsTitleModalOpen(false)}>
              <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
                <ModalHeader theme={theme}>
                  <ModalTitle theme={theme}>Title</ModalTitle>
                  <CloseButton theme={theme} onClick={() => setIsTitleModalOpen(false)}>
                    ×
                  </CloseButton>
                </ModalHeader>
                <ModalBody theme={theme}>
                  <ModalTextArea
                    theme={theme}
                    value={chunkTitle}
                    onChange={(e) => setChunkTitle(e.target.value)}
                    placeholder="Введите заголовок..."
                  />
                </ModalBody>
              </ModalContent>
            </ModalOverlay>
          )}
        </div>
      </ThemeProvider>
    </Layout>
  );
};

