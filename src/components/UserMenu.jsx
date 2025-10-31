import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { ToggleTheme } from './ToggleTheme';
import { useNavigate } from 'react-router-dom';
import { HiUserCircle } from 'react-icons/hi2';

const UserMenuContainer = styled.div`
  position: relative;
`;

const UserIconButton = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.2s ease;
  z-index: 1000;
  border: 1px solid ${({ theme }) => theme.colors.border};

  ${UserMenuContainer}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const MenuItem = styled.div`
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D'
        ? '#f0f0f0'
        : 'rgba(255,255,255,0.08)'};
  }

  &:not(:last-child) {
    margin-bottom: 4px;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  transition: all 0.15s ease;
  margin-top: 4px;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D'
        ? 'rgba(239,68,68,0.1)'
        : 'rgba(239,68,68,0.15)'};
    color: #ef4444;
  }
`;

const ThemeSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ThemeLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const UserMenu = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <UserMenuContainer>
      <UserIconButton theme={theme}>
        <HiUserCircle style={{ fontSize: '24px', color: theme.colors.primary }} />
      </UserIconButton>
      <DropdownMenu theme={theme}>
        <MenuItem theme={theme}>
          <ThemeSection>
            <ThemeLabel theme={theme}>Тема</ThemeLabel>
            <ToggleTheme />
          </ThemeSection>
        </MenuItem>
        <LogoutButton theme={theme} onClick={handleLogout}>
          Выйти
        </LogoutButton>
      </DropdownMenu>
    </UserMenuContainer>
  );
};

