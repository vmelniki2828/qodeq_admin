import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { Layout } from 'components/Layout';
import { HiWrench, HiChevronLeft, HiPencil, HiTrash } from 'react-icons/hi2';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

// Вспомогательные функции для работы с куками
const getCookie = (name) => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const setCookie = (name, value, days = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=.test.qodeq.net`;
};

// Функция для обновления токена
const refreshToken = async () => {
  const refreshTokenValue = getCookie('user_refresh_token');
  
  if (!refreshTokenValue) {
    throw new Error('Refresh token не найден');
  }

  const response = await fetch('https://auth.test.qodeq.net/api/v1/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: refreshTokenValue,
    }),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Ошибка при обновлении токена');
  }

  const data = await response.json();
  const accessToken = data.access_token || data.accessToken || data.token || data.data?.access_token;
  const newRefreshToken = data.refresh_token || data.refreshToken || data.data?.refresh_token;

  if (accessToken) {
    setCookie('user_access_token', accessToken);
  }

  if (newRefreshToken) {
    setCookie('user_refresh_token', newRefreshToken);
  }

  return accessToken;
};

// Функция для выполнения запросов с автоматическим обновлением токена
const fetchWithRefresh = async (url, options = {}) => {
  const accessToken = getCookie('user_access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  // Если получили 401, проверяем, это ли "Expired token"
  if (response.status === 401) {
    const responseClone = response.clone();
    let errorData = {};
    
    try {
      errorData = await responseClone.json();
    } catch (e) {
      const text = await responseClone.text();
      try {
        errorData = JSON.parse(text);
      } catch (e2) {
        console.error('Не удалось распарсить ответ ошибки:', text);
      }
    }
    
    const isExpiredToken = 
      errorData.detail === 'Expired token' || 
      errorData.detail === 'Expired token.' ||
      errorData.detail?.toLowerCase().includes('expired') ||
      errorData.message === 'Expired token' ||
      errorData.message?.toLowerCase().includes('expired');
    
    if (isExpiredToken) {
      try {
        const newAccessToken = await refreshToken();
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include'
        });
      } catch (refreshError) {
        console.error('Ошибка при обновлении токена:', refreshError);
        Notify.failure('Сессия истекла. Пожалуйста, войдите в систему заново.');
        throw refreshError;
      }
    }
  }

  return response;
};

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 69px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SelectLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

const SelectIcon = styled(HiWrench)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
`;

const Select = styled.select`
  min-width: 300px;
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

const ButtonsGroup = styled.div`
  display: flex;
  gap: 12px;
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

const ContentArea = styled.div`
  flex: 1;
  padding: 0;
  overflow-y: auto;
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

const FormSelect = styled.select`
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

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
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
  user-select: none;
  ${({ $width }) => $width && `width: ${$width};`}
`;

const TableBody = styled.tbody``;

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

  ${({ $danger, theme }) =>
    $danger &&
    `
    &:hover {
      color: #ef4444;
      background-color: rgba(239,68,68,0.1);
    }
  `}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.secondary};
  text-align: center;
`;

const EmptyStateTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 8px 0;
`;

const EmptyStateText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondary};
  margin: 0;
`;

export const IntegrationsPage = () => {
  const { theme } = useTheme();
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [isLoadingBots, setIsLoadingBots] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingBotId, setEditingBotId] = useState(null);
  const [assistants, setAssistants] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    assistantId: '',
    provider: '',
    externalId: '',
    isActive: false,
    triggers: []
  });

  // Загрузка интеграций с API
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWithRefresh('https://chat.test.qodeq.net/api/v1/integrations/configured', {
          method: 'GET'
        });

        if (!response.ok) {
          if (response.status === 401) {
            Notify.failure('Требуется авторизация. Пожалуйста, войдите в систему.');
            return;
          }
          throw new Error('Ошибка при загрузке интеграций');
        }

        const data = await response.json();
        // Обработка ответа: может быть массив строк или массив объектов
        let integrationsList = [];
        if (Array.isArray(data)) {
          // Если массив строк, преобразуем в объекты
          if (data.length > 0 && typeof data[0] === 'string') {
            integrationsList = data.map((name, index) => ({ id: name, name: name }));
          } else {
            // Если массив объектов
            integrationsList = data;
          }
        } else {
          // Если объект с results или data
          const results = data.results || data.data || [];
          if (results.length > 0 && typeof results[0] === 'string') {
            integrationsList = results.map((name, index) => ({ id: name, name: name }));
          } else {
            integrationsList = results;
          }
        }
        setIntegrations(integrationsList);
      } catch (error) {
        console.error('Ошибка при загрузке интеграций:', error);
        Notify.failure('Не удалось загрузить интеграции');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  // Загрузка ассистентов для выбора
  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetchWithRefresh('https://chat.test.qodeq.net/api/v1/assistants/', {
          method: 'GET'
        });

        if (!response.ok) {
          if (response.status === 401) {
            return;
          }
          throw new Error('Ошибка при загрузке ассистентов');
        }

        const data = await response.json();
        const assistantsList = Array.isArray(data) ? data : (data.results || data.data || []);
        setAssistants(assistantsList);
      } catch (error) {
        console.error('Ошибка при загрузке ассистентов:', error);
      }
    };

    fetchAssistants();
  }, []);

  // Загрузка ботов при выборе интеграции
  useEffect(() => {
    const fetchBots = async () => {
      if (!selectedIntegration) {
        setBots([]);
        return;
      }

      try {
        setIsLoadingBots(true);
        const response = await fetchWithRefresh(
          `https://chat.test.qodeq.net/api/v1/integrations/bots?adapter_type=${selectedIntegration}`,
          {
            method: 'GET'
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            Notify.failure('Требуется авторизация. Пожалуйста, войдите в систему.');
            return;
          }
          throw new Error('Ошибка при загрузке ботов');
        }

        const data = await response.json();
        // Обработка разных форматов ответа API
        const botsList = Array.isArray(data) ? data : (data.results || data.data || []);
        setBots(botsList);
      } catch (error) {
        console.error('Ошибка при загрузке ботов:', error);
        Notify.failure('Не удалось загрузить ботов');
        setBots([]);
      } finally {
        setIsLoadingBots(false);
      }
    };

    fetchBots();
  }, [selectedIntegration]);

  const handleNewIntegration = () => {
    setEditingBotId(null);
    setFormData({
      name: '',
      assistantId: '',
      provider: '',
      externalId: '',
      isActive: false,
      triggers: []
    });
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    setEditingBotId(null);
    setFormData({
      name: '',
      assistantId: '',
      provider: '',
      externalId: '',
      isActive: false,
      triggers: []
    });
  };

  const handleEdit = async (botId, e) => {
    e.stopPropagation();
    
    if (!botId) {
      Notify.failure('ID бота не указан');
      return;
    }

    try {
      const response = await fetchWithRefresh(
        `https://chat.test.qodeq.net/api/v1/integrations/bots/${botId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        if (response.status === 401) {
          Notify.failure('Требуется авторизация. Пожалуйста, войдите в систему.');
          return;
        }
        if (response.status === 404) {
          Notify.failure('Бот не найден');
          return;
        }
        throw new Error('Ошибка при загрузке данных бота');
      }

      const botData = await response.json();
      
      console.log('Bot data received:', botData);
      
      setEditingBotId(botId);
      setFormData({
        name: botData.name || '',
        assistantId: botData.assistant_id ? String(botData.assistant_id) : '',
        provider: botData.provider || '',
        externalId: botData.external_id || '',
        isActive: botData.is_active !== undefined ? botData.is_active : false,
        triggers: Array.isArray(botData.triggers) ? botData.triggers : []
      });
      setIsSettingsOpen(true);
    } catch (error) {
      console.error('Ошибка при загрузке данных бота:', error);
      Notify.failure(error.message || 'Не удалось загрузить данные бота');
    }
  };

  const handleDelete = async (botId, e) => {
    e.stopPropagation();
    // TODO: Implement delete logic
    console.log('Delete bot:', botId);
    Notify.info('Функция удаления будет реализована');
  };

  const handleSave = async () => {
    // Проверяем каждое поле отдельно для более понятного сообщения
    if (!formData.name) {
      Notify.failure('Заполните поле Name');
      return;
    }
    if (!formData.assistantId) {
      Notify.failure('Выберите Assistant');
      return;
    }
    if (!formData.provider) {
      Notify.failure('Выберите Provider');
      return;
    }

    try {
      const requestBody = {
        name: formData.name,
        assistant_id: Number(formData.assistantId),
        provider: formData.provider
      };

      // При редактировании добавляем is_active, если оно было изменено
      if (editingBotId) {
        requestBody.is_active = formData.isActive;
      }

      let response;
      if (editingBotId) {
        // Редактирование существующего бота
        response = await fetchWithRefresh(
          `https://chat.test.qodeq.net/api/v1/integrations/bots/${editingBotId}`,
          {
            method: 'PATCH',
            body: JSON.stringify(requestBody)
          }
        );
      } else {
        // Создание нового бота
        response = await fetchWithRefresh('https://chat.test.qodeq.net/api/v1/integrations/bots', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });
      }

      if (!response.ok) {
        if (response.status === 401) {
          Notify.failure('Требуется авторизация. Пожалуйста, войдите в систему.');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || `Ошибка при ${editingBotId ? 'обновлении' : 'создании'} интеграции`);
      }

      const data = await response.json();
      Notify.success(`Интеграция успешно ${editingBotId ? 'обновлена' : 'создана'}`);
      
      // Обновляем список ботов
      if (selectedIntegration) {
        const botsResponse = await fetchWithRefresh(
          `https://chat.test.qodeq.net/api/v1/integrations/bots?adapter_type=${selectedIntegration}`,
          { method: 'GET' }
        );
        if (botsResponse.ok) {
          const botsData = await botsResponse.json();
          const botsList = Array.isArray(botsData) ? botsData : (botsData.results || botsData.data || []);
          setBots(botsList);
        }
      }
      
      handleCloseSettings();
    } catch (error) {
      console.error(`Ошибка при ${editingBotId ? 'обновлении' : 'создании'} интеграции:`, error);
      Notify.failure(error.message || `Не удалось ${editingBotId ? 'обновить' : 'создать'} интеграцию`);
    }
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <PageContent>
          <HeaderSection data-header>
            <Title>Integrations</Title>
            <SelectContainer>
              <SelectLabel theme={theme}>
                <SelectIcon theme={theme} />
                Select Integration
              </SelectLabel>
              <Select 
                theme={theme}
                value={selectedIntegration} 
                onChange={(e) => setSelectedIntegration(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Choose an integration...</option>
                {integrations.map((integration) => (
                  <option key={integration.id} value={integration.id}>
                    {integration.name || integration.description || `Integration ${integration.id}`}
                  </option>
                ))}
              </Select>
            </SelectContainer>
            <ButtonsGroup>
              <Button theme={theme} $primary onClick={handleNewIntegration}>
                New Integration
              </Button>
            </ButtonsGroup>
          </HeaderSection>
          <ContentArea theme={theme}>
            <PageContainer>
              <LeftPanel $isFullWidth={!isSettingsOpen}>
                {!selectedIntegration ? (
                  <EmptyState theme={theme}>
                    <EmptyStateTitle theme={theme}>Integrations</EmptyStateTitle>
                    <EmptyStateText theme={theme}>
                      Выберите интеграцию для просмотра ботов
                    </EmptyStateText>
                  </EmptyState>
                ) : isLoadingBots ? (
                  <EmptyState theme={theme}>
                    <EmptyStateText theme={theme}>Загрузка ботов...</EmptyStateText>
                  </EmptyState>
                ) : bots.length === 0 ? (
                  <EmptyState theme={theme}>
                    <EmptyStateTitle theme={theme}>Боты не найдены</EmptyStateTitle>
                    <EmptyStateText theme={theme}>
                      Для выбранной интеграции боты не найдены
                    </EmptyStateText>
                  </EmptyState>
                ) : (
                  <TableContainer>
                    <Table theme={theme}>
                      <TableHeader theme={theme}>
                        <TableHeaderRow theme={theme}>
                          <TableHeaderCell theme={theme}>ID</TableHeaderCell>
                          <TableHeaderCell theme={theme}>Name</TableHeaderCell>
                          <TableHeaderCell theme={theme}>Adapter Type</TableHeaderCell>
                          <TableHeaderCell theme={theme}>Status</TableHeaderCell>
                          <TableHeaderCell theme={theme} $width="120px">Actions</TableHeaderCell>
                        </TableHeaderRow>
                      </TableHeader>
                      <TableBody>
                        {bots.map((bot) => (
                          <TableRow key={bot.id || bot.bot_id || Math.random()} theme={theme}>
                            <TableCell theme={theme}>{bot.id || bot.bot_id || '-'}</TableCell>
                            <TableCell theme={theme}>{bot.name || bot.bot_name || '-'}</TableCell>
                            <TableCell theme={theme}>{bot.adapter_type || selectedIntegration || '-'}</TableCell>
                            <TableCell theme={theme}>{bot.status || bot.is_active !== undefined ? (bot.is_active ? 'Active' : 'Inactive') : '-'}</TableCell>
                            <ActionsCell theme={theme}>
                              <ActionButton theme={theme} onClick={(e) => handleEdit(bot.id || bot.bot_id, e)} title="Edit">
                                <HiPencil size={16} />
                              </ActionButton>
                              <ActionButton
                                theme={theme}
                                $danger
                                onClick={(e) => handleDelete(bot.id || bot.bot_id, e)}
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
                )}
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
                    <SettingLabel theme={theme}>Name</SettingLabel>
                    <SettingContent>
                      <TextInput
                        theme={theme}
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter integration name..."
                      />
                    </SettingContent>
                  </SettingSection>

                  <SettingSection>
                    <SettingLabel theme={theme}>Assistant</SettingLabel>
                    <SettingContent>
                      <FormSelect
                        theme={theme}
                        value={formData.assistantId}
                        onChange={(e) => setFormData({ ...formData, assistantId: e.target.value })}
                      >
                        <option value="">Select assistant</option>
                        {assistants.map((assistant) => (
                          <option key={assistant.id} value={assistant.id}>
                            {assistant.description || assistant.name || `Assistant ${assistant.id}`} (id: {assistant.id})
                          </option>
                        ))}
                      </FormSelect>
                    </SettingContent>
                  </SettingSection>

                  <SettingSection>
                    <SettingLabel theme={theme}>Provider</SettingLabel>
                    <SettingContent>
                      <FormSelect
                        theme={theme}
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      >
                        <option value="">Select provider</option>
                        {integrations.map((integration) => (
                          <option key={integration.id} value={integration.id}>
                            {integration.name || integration.description || `Integration ${integration.id}`}
                          </option>
                        ))}
                      </FormSelect>
                    </SettingContent>
                  </SettingSection>

                  {editingBotId && (
                    <>
                      <SettingSection>
                        <SettingLabel theme={theme}>Is Active</SettingLabel>
                        <SettingContent>
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </SettingContent>
                      </SettingSection>

                      <SettingSection>
                        <SettingLabel theme={theme}>Triggers</SettingLabel>
                        <SettingContent>
                          <TextInput
                            theme={theme}
                            type="text"
                            value={Array.isArray(formData.triggers) ? formData.triggers.join(', ') : ''}
                            readOnly
                            style={{ backgroundColor: 'rgba(0,0,0,0.05)', cursor: 'not-allowed' }}
                            placeholder="No triggers"
                          />
                        </SettingContent>
                      </SettingSection>
                    </>
                  )}

                  <SaveButton theme={theme} onClick={handleSave}>
                    Сохранить изменения
                  </SaveButton>
                </RightContent>
              </RightPanel>
            </PageContainer>
          </ContentArea>
        </PageContent>
      </ThemeProvider>
    </Layout>
  );
};

