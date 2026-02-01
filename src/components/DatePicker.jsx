import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const DatePickerContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DateInput = styled.input`
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
  min-width: 180px;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const CalendarDropdown = styled.div`
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 1000;
  width: 280px;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MonthYear = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
  }
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
`;

const WeekDay = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.secondary};
  padding: 4px;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: ${({ theme, $isSelected, $isOtherMonth }) =>
    $isSelected
      ? '#FFFFFF'
      : $isOtherMonth
      ? theme.colors.muted
      : theme.colors.primary};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ theme, $isSelected }) =>
      $isSelected
        ? theme.colors.accentHover || theme.colors.accent
        : theme.colors.primary === '#0D0D0D'
        ? '#f0f0f0'
        : 'rgba(255,255,255,0.08)'};
  }

  ${({ $isSelected, theme }) =>
    $isSelected &&
    `
    background-color: ${theme.colors.accent};
    color: #FFFFFF;
  `}

  ${({ $isOtherMonth }) =>
    $isOtherMonth &&
    `
    opacity: 0.5;
  `}
`;

const CalendarFooter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const FooterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
  }
`;

const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Парсит YYYY-MM-DD как локальную дату (без сдвига на день из-за UTC)
const parseDateLocal = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  const parts = dateString.trim().split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  return new Date(y, m, d);
};

// Форматирует дату в YYYY-MM-DD по локальным компонентам (toISOString даёт UTC и сдвигает день)
const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DatePicker = ({ value, onChange, id }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [currentDate, setCurrentDate] = useState(() => {
    const parsed = parseDateLocal(value);
    if (parsed) return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (dateString) => {
    const date = parseDateLocal(dateString);
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleInputClick = () => {
    if (!isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const calendarHeight = 350;
      const calendarWidth = 280;
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top, left;

      if (spaceBelow >= calendarHeight || spaceBelow > spaceAbove) {
        top = rect.bottom + 8;
      } else {
        top = rect.top - calendarHeight - 8;
      }

      const inputCenterX = rect.left + (rect.width / 2);
      left = inputCenterX;

      const calendarHalfWidth = calendarWidth / 2;
      const minLeft = 16 + calendarHalfWidth;
      const maxLeft = windowWidth - 16 - calendarHalfWidth;

      if (inputCenterX < minLeft) {
        left = minLeft;
      } else if (inputCenterX > maxLeft) {
        left = maxLeft;
      }

      setCalendarPosition({ top, left });
    }
    setIsOpen(!isOpen);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onChange({ target: { value: formatDateToISO(selectedDate) } });
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange({ target: { value: formatDateToISO(today) } });
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setIsOpen(false);
  };

  const handleDelete = () => {
    onChange({ target: { value: '' } });
    setIsOpen(false);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const selectedDate = value ? parseDateLocal(value) : null;

    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isOtherMonth: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();
      days.push({
        day,
        isSelected,
        isOtherMonth: false,
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isOtherMonth: true,
      });
    }

    return days;
  };

  return (
    <DatePickerContainer ref={containerRef}>
      <DateInput
        ref={inputRef}
        theme={theme}
        id={id}
        type="text"
        value={formatDate(value)}
        onClick={handleInputClick}
        readOnly
        placeholder="Выберите дату"
      />
      {isOpen && (
        <CalendarDropdown
          theme={theme}
          $top={calendarPosition.top}
          $left={calendarPosition.left}
        >
          <CalendarHeader>
            <NavButton theme={theme} onClick={handlePrevMonth}>
              <HiChevronLeft size={16} />
            </NavButton>
            <MonthYear theme={theme}>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </MonthYear>
            <NavButton theme={theme} onClick={handleNextMonth}>
              <HiChevronRight size={16} />
            </NavButton>
          </CalendarHeader>
          <WeekDays>
            {weekDays.map((day) => (
              <WeekDay key={day} theme={theme}>
                {day}
              </WeekDay>
            ))}
          </WeekDays>
          <CalendarGrid>
            {renderCalendar().map((item, index) => (
              <DayButton
                key={index}
                theme={theme}
                $isSelected={item.isSelected}
                $isOtherMonth={item.isOtherMonth}
                onClick={() => !item.isOtherMonth && handleDayClick(item.day)}
              >
                {item.day}
              </DayButton>
            ))}
          </CalendarGrid>
          <CalendarFooter>
            <FooterButton theme={theme} onClick={handleDelete}>
              Удалить
            </FooterButton>
            <FooterButton theme={theme} onClick={handleToday}>
              Сегодня
            </FooterButton>
          </CalendarFooter>
        </CalendarDropdown>
      )}
    </DatePickerContainer>
  );
};

