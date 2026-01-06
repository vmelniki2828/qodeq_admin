import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ToggleTheme } from 'components/ToggleTheme';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

// Вспомогательные функции для работы с куками
const setCookie = (name, value, days = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=.test.qodeq.net`;
};

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) =>
    theme.colors.background === '#FFFFFF'
      ? '#f5f5f5'
      : theme.colors.surface};
  position: relative;
`;

const ThemeToggleWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка заполненности полей
    if (!email || !password) {
      Notify.failure('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://auth.test.qodeq.net/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          integration: null,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        Notify.failure(errorData.message || 'Неверный email или пароль');
        setIsLoading(false);
      return;
    }

      const data = await response.json();
      
      // Сохранение токенов в куки
      // Обработка разных форматов ответа API
      const accessToken = data.access_token || data.accessToken || data.token || data.data?.access_token;
      const refreshToken = data.refresh_token || data.refreshToken || data.data?.refresh_token;
      
      if (accessToken) {
        setCookie('user_access_token', accessToken);
      }
      
      if (refreshToken) {
        setCookie('user_refresh_token', refreshToken);
      }

    // Успешная авторизация
    Notify.success('Вход выполнен успешно!');
      setIsLoading(false);
    setTimeout(() => {
      navigate('/tools-workflow');
    }, 500);
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      Notify.failure('Произошла ошибка при подключении к серверу');
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer theme={theme}>
      <ThemeToggleWrapper>
      <ToggleTheme />
      </ThemeToggleWrapper>
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          padding: '40px',
          backgroundColor: theme.colors.background,
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h2
          style={{
            marginBottom: '30px',
            textAlign: 'center',
            color: theme.colors.primary,
            fontSize: '28px',
          }}
        >
          Qodeq Admin Panel
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: theme.colors.primary,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '4px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s',
                backgroundColor: theme.colors.background,
                color: theme.colors.primary,
              }}
              placeholder="Введите email"
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: theme.colors.primary,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '4px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s',
                backgroundColor: theme.colors.background,
                color: theme.colors.primary,
              }}
              placeholder="Введите пароль"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? theme.colors.secondary : theme.colors.primary,
              color: theme.colors.background,
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s, opacity 0.3s',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.opacity = '0.8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.opacity = '1';
              }
            }}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </LoginContainer>
  );
};

