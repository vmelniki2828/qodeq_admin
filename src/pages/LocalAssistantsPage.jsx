import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { Layout } from 'components/Layout';
import { HiPencil } from 'react-icons/hi2';

const PageContainer = styled.div`
  display: flex;
  height: 100%;
  position: relative;
`;

const LeftPanel = styled.div`
  width: ${({ $width }) => $width}px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
`;

const Divider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  cursor: col-resize;
  position: relative;

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
  position: absolute;
  top: 20px;
  right: 20px;
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
  z-index: 10;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
  }
`;

const RightContent = styled.div`
  padding: 20px;
  padding-top: 60px;
  overflow-y: auto;
  height: 100%;
`;

const SettingSection = styled.div`
  margin-bottom: 24px;
`;

const SettingLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 12px;
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

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.accent};
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
  { id: 1, description: 'Cat' },
  { id: 2, description: 'Gama' },
  { id: 3, description: 'Daddy' },
  { id: 5, description: 'Kent' },
  { id: 6, description: 'R7' },
  { id: 7, description: 'Kometa' },
  { id: 8, description: 'Arkada' },
  { id: 9, description: 'Motor' },
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

export const LocalAssistantsPage = () => {
  const { theme } = useTheme();
  const [leftWidth, setLeftWidth] = useState(400);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [selectedTools, setSelectedTools] = useState(new Set());
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      // Ограничения: минимальная ширина левой панели 400px, максимальная 80% от ширины контейнера
      const minWidth = 400;
      const maxWidth = containerRect.width * 0.8;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
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

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = leftWidth;
  };

  return (
    <Layout>
      <PageContainer ref={containerRef}>
        <LeftPanel $width={leftWidth}>
          <HeaderSection theme={theme}>
            <Title theme={theme}>Local Assistants</Title>
            <ButtonsGroup>
              <Button theme={theme}>Export</Button>
              <Button theme={theme} $primary>
                New Local Assistant
              </Button>
            </ButtonsGroup>
          </HeaderSection>
          <AgentsList>
            {mockAgents.map((agent) => (
              <AgentBlock
                key={agent.id}
                theme={theme}
                $selected={selectedAgentId === agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <AgentDescription theme={theme}>{agent.description}</AgentDescription>
                <AgentId theme={theme}>id: {agent.id}</AgentId>
              </AgentBlock>
            ))}
          </AgentsList>
        </LeftPanel>

        <Divider theme={theme} onMouseDown={handleMouseDown} />

        <RightPanel>
          <EditButton theme={theme}>
            <HiPencil size={14} />
            <span>Edit</span>
          </EditButton>
          <RightContent>
            <SettingSection>
              <SettingLabel theme={theme}>Tools</SettingLabel>
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
            </SettingSection>
          </RightContent>
        </RightPanel>
      </PageContainer>
    </Layout>
  );
};
