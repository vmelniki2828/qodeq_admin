import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ToggleTheme } from 'components/ToggleTheme';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверка заполненности полей
    if (!username || !password) {
      Notify.failure('Пожалуйста, заполните все поля');
      return;
    }

    // Список валидных учетных данных
    const validCredentials = [
      { username: 'f5146e1a-3c5a-4d35-89a1-287e0e4383f3', password: 'rADtL4cspJ6g82372_VLfDGtwTgj9g' }, // cbc
      { username: 'f343517a-3cba-474d-8785-e780676d744a', password: 'rADtL4cspJ6g82372_VLfDGtwTgj9g' }, // trk
      { username: '72b9ca9c-3881-4120-867a-39a29c2d8cac', password: 'rADtL4cspJ6g82372_VLfDGtwTgj9g' }, // cis
      { username: '4bc85745-73f2-4899-b2b4-544b8f7cfa09', password: 'rADtL4cspJ6g82372_VLfDGtwTgj9g' }, // test
    ];

    // Проверка учетных данных
    const isValid = validCredentials.some(
      (cred) => cred.username === username && cred.password === password
    );

    if (!isValid) {
      Notify.failure('Неверный username или пароль');
      return;
    }

    // Успешная авторизация
    Notify.success('Вход выполнен успешно!');
    setTimeout(() => {
      navigate('/tools-workflow');
    }, 500);
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
              htmlFor="username"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: theme.colors.primary,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              placeholder="Введите username"
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
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: theme.colors.primary,
              color: theme.colors.background,
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s, opacity 0.3s',
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            Войти
          </button>
        </form>
      </div>
    </LoginContainer>
  );
};

