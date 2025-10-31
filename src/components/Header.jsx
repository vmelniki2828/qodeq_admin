import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { UserMenu } from './UserMenu';

const HeaderStyled = styled.header`
  height: 48px;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Header = () => {
  const { theme } = useTheme();

  return (
    <HeaderStyled theme={theme}>
      <HeaderSection>
        <Title theme={theme}>Qodeq Admin</Title>
      </HeaderSection>

      <HeaderSection>
        <UserMenu />
      </HeaderSection>
    </HeaderStyled>
  );
};
