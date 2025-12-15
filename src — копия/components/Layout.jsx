import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Main = styled.main`
  flex: 1;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 0 10px 10px 3px;
  display: flex;
  align-items: stretch;
  justify-content: center;
`;

const ContentArea = styled.div`
  width: 100%;
  max-width: 100%;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.colors.surface === '#F9FAFB' ? '#F0F1F3' : theme.colors.surface};
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: auto;
`;

export const Layout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <LayoutContainer theme={theme}>
      <Header />
      <ContentWrapper>
        <Sidebar />
        <Main theme={theme}>
          
          <ContentArea theme={theme}>
            {children}
          </ContentArea>
        </Main>
      </ContentWrapper>
    </LayoutContainer>
  );
};
