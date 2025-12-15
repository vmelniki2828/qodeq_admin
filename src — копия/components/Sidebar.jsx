import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarStyled = styled.aside`
  width: 210px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 16px 12px;
`;

const Nav = styled.nav`
  flex: 1;
  overflow-y: auto;
`;

const MenuItem = styled.div`
  padding: 10px 14px;
  margin: 2px 0;
  border-radius: 6px;
  cursor: pointer;
  background-color: ${({ $active, theme }) =>
    $active
      ? theme.colors.primary === '#0D0D0D'
        ? '#f0f0f0'
        : 'rgba(255,255,255,0.08)'
      : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.secondary};
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? '500' : '400')};

  &:hover {
    background-color: ${({ $active, theme }) =>
      !$active
        ? theme.colors.primary === '#0D0D0D'
          ? '#f8f8f8'
          : 'rgba(255,255,255,0.04)'
        : null};
  }
`;

export const Sidebar = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Tools Workflow', path: '/tools-workflow' },
    { label: 'Local Assistants', path: '/local-assistants' },
    { label: 'Text Chunks', path: '/text-chunks' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <SidebarStyled theme={theme}>
      <Nav>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <MenuItem
              key={item.path}
              $active={active}
              theme={theme}
              onClick={() => navigate(item.path)}
            >
              <span>{item.label}</span>
            </MenuItem>
          );
        })}
      </Nav>
    </SidebarStyled>
  );
};
