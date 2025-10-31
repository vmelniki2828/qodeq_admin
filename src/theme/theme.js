import { lightTheme, darkTheme } from './colors';

// Функция для получения текущей темы
export const getTheme = (isDark = false) => {
  return isDark ? darkTheme : lightTheme;
};

// Функция для переключения темы
export const toggleTheme = (currentTheme) => {
  return currentTheme === 'light' ? 'dark' : 'light';
};

// Определение цветов для удобного использования
export { lightTheme, darkTheme };

// Экспорт по умолчанию
export default {
  light: lightTheme,
  dark: darkTheme,
};


