import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { Layout } from 'components/Layout';
import { DatePicker } from 'components/DatePicker';
import fallbackData from '../data.json';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

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

const DatePickersRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DatePickerLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;

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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${({ theme }) =>
    theme.colors.primary === '#ECECEC'
      ? '0 4px 24px rgba(0,0,0,0.25)'
      : '0 2px 12px rgba(0,0,0,0.06)'};
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) =>
      theme.colors.primary === '#ECECEC'
        ? '0 8px 32px rgba(0,0,0,0.35)'
        : '0 4px 20px rgba(0,0,0,0.08)'};
  }
`;

const ChartWrapper = styled.div`
  outline: none !important;
  &,
  &:focus,
  &:focus-visible {
    outline: none !important;
  }
  *,
  *:focus,
  *:focus-visible {
    outline: none !important;
  }
  svg {
    outline: none !important;
  }
  svg:focus {
    outline: none !important;
  }
`;

const ChartTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: -0.02em;
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${({ theme }) =>
    theme.colors.primary === '#ECECEC'
      ? '0 2px 16px rgba(0,0,0,0.2)'
      : '0 1px 8px rgba(0,0,0,0.04)'};
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) =>
      theme.colors.primary === '#ECECEC'
        ? '0 6px 24px rgba(0,0,0,0.3)'
        : '0 4px 16px rgba(0,0,0,0.08)'};
  }
`;

const SummaryCardLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
`;

const SummaryCardValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const TableSectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: -0.02em;
`;

const DetailTableToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const DaySelectLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

const DaySelect = styled.select`
  min-width: 160px;
  padding: 8px 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const ChartSubtitle = styled.p`
  margin: -8px 0 16px 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.secondary};
  line-height: 1.4;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 8px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  border-radius: 12px;

  thead tr:first-child th:first-child {
    border-top-left-radius: 12px;
  }

  thead tr:first-child th:last-child {
    border-top-right-radius: 12px;
  }

  tbody tr:last-child td:first-child {
    border-bottom-left-radius: 12px;
  }

  tbody tr:last-child td:last-child {
    border-bottom-right-radius: 12px;
  }
`;

const TableHeader = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TableHeaderRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  vertical-align: middle;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  ${({ $align }) => $align === 'right' && 'text-align: right;'}
  ${({ $align }) => $align === 'center' && 'text-align: center;'}
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
  padding: 10px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};
  vertical-align: middle;
  ${({ $align }) => $align === 'right' && 'text-align: right;'}
  ${({ $align }) => $align === 'center' && 'text-align: center;'}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  padding: 20px;
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

// Нормализует ответ API: массив массивов [date, project, total, solved, bot_transfer, manual_transfer, deposits, wd_status]
const normalizeStatisticsRows = (data) => {
  if (!data) return [];
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (Array.isArray(first)) return data;
    if (typeof first === 'object' && first !== null) {
      return data.map((row) => [
        row.date ?? row[0],
        row.project ?? row.name ?? row[1],
        row.total ?? row[2],
        row.solved ?? row[3],
        row.bot_transfer ?? row[4],
        row.manual_transfer ?? row[5],
        row.deposits ?? row[6],
        row.wd_status ?? row[7],
      ]);
    }
  }
  return [];
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '—';
  const [y, m, d] = String(dateStr).split('-');
  return d && m && y ? `${d}.${m}.${y}` : dateStr;
};

// Агрегация по датам для графика по времени
const aggregateByDate = (rows) => {
  const byDate = {};
  rows.forEach((row) => {
    const d = row[0];
    if (!d) return;
    if (!byDate[d]) {
      byDate[d] = { date: d, total: 0, solved: 0, botTransfer: 0, manualTransfer: 0, deposits: 0, wdStatus: 0 };
    }
    byDate[d].total += Number(row[2]) || 0;
    byDate[d].solved += Number(row[3]) || 0;
    byDate[d].botTransfer += Number(row[4]) || 0;
    byDate[d].manualTransfer += Number(row[5]) || 0;
    byDate[d].deposits += Number(row[6]) || 0;
    byDate[d].wdStatus += Number(row[7]) || 0;
  });
  return Object.keys(byDate)
    .sort()
    .map((k) => ({ ...byDate[k], dateLabel: formatDisplayDate(k) }));
};

// Агрегация по проектам для bar/pie (топ по total)
const aggregateByProject = (rows, limit = 10) => {
  const byProject = {};
  rows.forEach((row) => {
    const name = row[1] != null && row[1] !== '' ? row[1] : 'Не на ботах (VIP)';
    if (!byProject[name]) {
      byProject[name] = { name, total: 0, solved: 0 };
    }
    byProject[name].total += Number(row[2]) || 0;
    byProject[name].solved += Number(row[3]) || 0;
  });
  return Object.values(byProject)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};

// Сводка по проектам: все метрики для таблицы
const aggregateByProjectFull = (rows) => {
  const byProject = {};
  rows.forEach((row) => {
    const name = row[1] != null && row[1] !== '' ? row[1] : 'Не на ботах (VIP)';
    if (!byProject[name]) {
      byProject[name] = {
        name,
        total: 0,
        solved: 0,
        botTransfer: 0,
        manualTransfer: 0,
        deposits: 0,
        wdStatus: 0,
      };
    }
    byProject[name].total += Number(row[2]) || 0;
    byProject[name].solved += Number(row[3]) || 0;
    byProject[name].botTransfer += Number(row[4]) || 0;
    byProject[name].manualTransfer += Number(row[5]) || 0;
    byProject[name].deposits += Number(row[6]) || 0;
    byProject[name].wdStatus += Number(row[7]) || 0;
  });
  return Object.values(byProject).sort((a, b) => b.total - a.total);
};

// Сводка за период
const getSummary = (rows) => {
  let total = 0,
    solved = 0,
    botTransfer = 0,
    manualTransfer = 0,
    deposits = 0,
    wdStatus = 0;
  rows.forEach((row) => {
    total += Number(row[2]) || 0;
    solved += Number(row[3]) || 0;
    botTransfer += Number(row[4]) || 0;
    manualTransfer += Number(row[5]) || 0;
    deposits += Number(row[6]) || 0;
    wdStatus += Number(row[7]) || 0;
  });
  return { total, solved, botTransfer, manualTransfer, deposits, wdStatus };
};

export const StatisticsPage = () => {
  const { theme } = useTheme();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statisticsData, setStatisticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailDayFilter, setDetailDayFilter] = useState('');

  useEffect(() => {
    if (!dateFrom || !dateTo) {
      setStatisticsData(null);
      return;
    }

    // Даты уже в формате YYYY-MM-DD из DatePicker
    const url = `https://chat.qodeq.net/api/v1/statistics/daily?start_date=${dateFrom}&end_date=${dateTo}`;

    const fetchStatistics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        const data = await response.json();
        setStatisticsData(data);
        setError(null);
        setDetailDayFilter('');
      } catch (err) {
        console.error('Ошибка при загрузке статистики:', err);
        setError(null);
        setStatisticsData(Array.isArray(fallbackData) ? fallbackData : []);
        setDetailDayFilter('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [dateFrom, dateTo]);

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <PageContent>
          <HeaderSection theme={theme}>
            <Title theme={theme}>Statistics</Title>
            <DatePickersRow>
              <DatePickerLabel theme={theme}>От</DatePickerLabel>
              <DatePicker
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                id="statistics-date-from"
              />
              <DatePickerLabel theme={theme}>До</DatePickerLabel>
              <DatePicker
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                id="statistics-date-to"
              />
            </DatePickersRow>
          </HeaderSection>
          <ContentArea theme={theme}>
            {!dateFrom || !dateTo ? (
              <EmptyState theme={theme}>
                <EmptyStateTitle theme={theme}>Statistics</EmptyStateTitle>
                <EmptyStateText theme={theme}>
                  Выберите период «От» и «До» для загрузки статистики
                </EmptyStateText>
              </EmptyState>
            ) : isLoading ? (
              <EmptyState theme={theme}>
                <EmptyStateText theme={theme}>Загрузка...</EmptyStateText>
              </EmptyState>
            ) : error ? (
              <EmptyState theme={theme}>
                <EmptyStateTitle theme={theme}>Ошибка</EmptyStateTitle>
                <EmptyStateText theme={theme}>{error}</EmptyStateText>
              </EmptyState>
            ) : statisticsData ? (
              (() => {
                const rows = normalizeStatisticsRows(statisticsData);
                const filteredRows = rows.filter((row) => {
                  const d = row[0];
                  if (!d) return false;
                  const dateStr = String(d);
                  return dateStr >= dateFrom && dateStr <= dateTo;
                });
                if (filteredRows.length === 0) {
                  return (
                    <EmptyState theme={theme}>
                      <EmptyStateText theme={theme}>Нет данных за выбранный период</EmptyStateText>
                    </EmptyState>
                  );
                }

                const summary = getSummary(filteredRows);
                const byDateData = aggregateByDate(filteredRows);
                const byProjectData = aggregateByProject(filteredRows);
                const byProjectFullData = aggregateByProjectFull(filteredRows);
                const uniqueDates = [...new Set(filteredRows.map((r) => r[0]).filter(Boolean))].sort();
                const detailRows =
                  detailDayFilter && uniqueDates.includes(detailDayFilter)
                    ? filteredRows.filter((r) => String(r[0]) === detailDayFilter)
                    : filteredRows;
                const isDark = theme.colors.primary === '#ECECEC';
                const gridStroke = isDark ? 'rgba(255,255,255,0.08)' : theme.colors.border;
                const textColor = theme.colors.primary;
                const tooltipBg = isDark ? theme.colors.surface : theme.colors.background;
                const tooltipBorder = theme.colors.border;

                return (
                  <>
                    <SummaryCards>
                      <SummaryCard theme={theme}>
                        <SummaryCardLabel theme={theme}>Всего чатов</SummaryCardLabel>
                        <SummaryCardValue theme={theme}>{summary.total.toLocaleString()}</SummaryCardValue>
                      </SummaryCard>
                      <SummaryCard theme={theme}>
                        <SummaryCardLabel theme={theme}>Решено ботом</SummaryCardLabel>
                        <SummaryCardValue theme={theme}>{summary.solved.toLocaleString()}</SummaryCardValue>
                      </SummaryCard>
                      <SummaryCard theme={theme}>
                        <SummaryCardLabel theme={theme}>Переведено ботом</SummaryCardLabel>
                        <SummaryCardValue theme={theme}>{summary.botTransfer.toLocaleString()}</SummaryCardValue>
                      </SummaryCard>
                      <SummaryCard theme={theme}>
                        <SummaryCardLabel theme={theme}>Переведено операторами</SummaryCardLabel>
                        <SummaryCardValue theme={theme}>{summary.manualTransfer.toLocaleString()}</SummaryCardValue>
                      </SummaryCard>
                      <SummaryCard theme={theme}>
                        <SummaryCardLabel theme={theme}>Тикетов депозитов</SummaryCardLabel>
                        <SummaryCardValue theme={theme}>{summary.deposits.toLocaleString()}</SummaryCardValue>
                      </SummaryCard>
                      <SummaryCard theme={theme}>
                        <SummaryCardLabel theme={theme}>Запросов WD Status</SummaryCardLabel>
                        <SummaryCardValue theme={theme}>{summary.wdStatus.toLocaleString()}</SummaryCardValue>
                      </SummaryCard>
                    </SummaryCards>

                    <ChartsGrid>
                      <ChartCard theme={theme}>
                        <ChartTitle theme={theme}>Динамика по дням</ChartTitle>
                        <ChartSubtitle theme={theme}>
                          Ось X — дата. Ось Y — количество. Синяя линия: всего чатов; голубая: решено ботом.
                        </ChartSubtitle>
                        <ChartWrapper>
                        <ResponsiveContainer width="100%" height={280}>
                          <AreaChart data={byDateData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={theme.colors.accent} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={theme.colors.accent} stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gradSolved" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                            <XAxis
                              dataKey="dateLabel"
                              tick={{ fill: textColor, fontSize: 11 }}
                              stroke={theme.colors.secondary}
                            />
                            <YAxis
                              tick={{ fill: textColor, fontSize: 11 }}
                              stroke={theme.colors.secondary}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: tooltipBg,
                                border: `1px solid ${tooltipBorder}`,
                                borderRadius: 8,
                                color: textColor,
                              }}
                              cursor={false}
                              labelStyle={{ color: textColor }}
                              formatter={(value, name) => [value.toLocaleString(), name === 'total' ? 'Всего чатов' : 'Решено ботом']}
                              labelFormatter={(label) => `Дата: ${label}`}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => <span style={{ color: textColor }}>{value === 'total' ? 'Всего чатов' : 'Решено ботом'}</span>} />
                            <Area
                              type="monotone"
                              dataKey="total"
                              name="Всего чатов"
                              stroke={theme.colors.accent}
                              strokeWidth={2}
                              fill="url(#gradTotal)"
                              dot={{ r: 4, fill: theme.colors.accent, stroke: theme.colors.surface, strokeWidth: 2 }}
                              activeDot={{ r: 5, fill: theme.colors.accent, stroke: theme.colors.surface, strokeWidth: 2 }}
                            />
                            <Area
                              type="monotone"
                              dataKey="solved"
                              name="Решено ботом"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              fill="url(#gradSolved)"
                              dot={{ r: 4, fill: '#3B82F6', stroke: theme.colors.surface, strokeWidth: 2 }}
                              activeDot={{ r: 5, fill: '#3B82F6', stroke: theme.colors.surface, strokeWidth: 2 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                        </ChartWrapper>
                      </ChartCard>

                      <ChartCard theme={theme}>
                        <ChartTitle theme={theme}>Топ проектов по чатам</ChartTitle>
                        <ChartSubtitle theme={theme}>
                          Горизонтальная ось — количество. Столбцы: всего чатов (акцент) и решено ботом (синий).
                        </ChartSubtitle>
                        <ChartWrapper>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={byProjectData} layout="vertical" margin={{ top: 10, right: 30, left: 8, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                            <XAxis
                              type="number"
                              tick={{ fill: textColor, fontSize: 11 }}
                              stroke={theme.colors.secondary}
                            />
                            <YAxis type="category" dataKey="name" width={130} tick={{ fill: textColor, fontSize: 11 }} stroke={theme.colors.secondary} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: tooltipBg,
                                border: `1px solid ${tooltipBorder}`,
                                borderRadius: 8,
                                color: textColor,
                              }}
                              cursor={false}
                              formatter={(value, name) => [value.toLocaleString(), name === 'total' ? 'Всего чатов' : 'Решено ботом']}
                              labelFormatter={(label) => `Проект: ${label}`}
                            />
                            <Bar dataKey="total" name="Всего чатов" fill={theme.colors.accent} radius={[0, 4, 4, 0]} activeBar={{ stroke: 'none' }} />
                            <Bar dataKey="solved" name="Решено ботом" fill="#3B82F6" radius={[0, 4, 4, 0]} activeBar={{ stroke: 'none' }} />
                          </BarChart>
                        </ResponsiveContainer>
                        </ChartWrapper>
                      </ChartCard>
                    </ChartsGrid>

                    <ChartCard theme={theme} style={{ marginBottom: 24 }}>
                      <ChartTitle theme={theme}>Распределение: Решено ботом / Переведено ботом / Переведено операторами</ChartTitle>
                      <ChartSubtitle theme={theme}>
                        Доля решённых ботом чатов, переводов ботом и переводов операторами вручную (когда бот не справился).
                      </ChartSubtitle>
                      <ChartWrapper>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Решено ботом', value: summary.solved, color: theme.colors.accent },
                              { name: 'Переведено ботом', value: summary.botTransfer, color: '#3B82F6' },
                              { name: 'Переведено операторами', value: summary.manualTransfer, color: '#8B5CF6' },
                            ].filter((d) => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: theme.colors.border }}
                            activeShape={{ stroke: 'none' }}
                          >
                            {[
                              { name: 'Решено ботом', value: summary.solved, color: theme.colors.accent },
                              { name: 'Переведено ботом', value: summary.botTransfer, color: '#3B82F6' },
                              { name: 'Переведено операторами', value: summary.manualTransfer, color: '#8B5CF6' },
                            ]
                              .filter((d) => d.value > 0)
                              .map((entry, index) => (
                                <Cell key={index} fill={entry.color} stroke={theme.colors.surface} strokeWidth={2} />
                              ))}
                          </Pie>
                          <Tooltip
                            cursor={false}
                            wrapperStyle={{ transition: 'none', animation: 'none' }}
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const segmentColor = payload[0].payload?.color ?? textColor;
                              return (
                                <div
                                  style={{
                                    backgroundColor: tooltipBg,
                                    border: `1px solid ${tooltipBorder}`,
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                    color: segmentColor,
                                    fontWeight: 600,
                                    fontSize: 13,
                                  }}
                                >
                                  {payload[0].name}: {Number(payload[0].value).toLocaleString()}
                                </div>
                              );
                            }}
                          />
                          <Legend formatter={(value) => <span style={{ color: textColor }}>{value}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                      </ChartWrapper>
                    </ChartCard>

                    <TableSectionTitle theme={theme}>Сводка по проектам (все метрики)</TableSectionTitle>
                    <ChartSubtitle theme={theme} style={{ marginTop: -8, marginBottom: 12 }}>
                      Агрегат по проектам за выбранный период. Проект пустой = чаты не на ботах (VIP).
                    </ChartSubtitle>
                    <TableContainer>
                      <Table theme={theme}>
                        <TableHeader theme={theme}>
                          <TableHeaderRow theme={theme}>
                            <TableHeaderCell theme={theme} $align="center">Проект</TableHeaderCell>
                            <TableHeaderCell theme={theme} $align="center">Всего чатов</TableHeaderCell>
                            <TableHeaderCell theme={theme} $align="center">Решено ботом</TableHeaderCell>
                            <TableHeaderCell theme={theme} $align="center">Переведено ботом</TableHeaderCell>
                            <TableHeaderCell theme={theme} $align="center">Переведено операторами</TableHeaderCell>
                            <TableHeaderCell theme={theme} $align="center">Депозиты</TableHeaderCell>
                            <TableHeaderCell theme={theme} $align="center">WD Status</TableHeaderCell>
                          </TableHeaderRow>
                        </TableHeader>
                        <TableBody>
                          {byProjectFullData.map((row, index) => (
                            <TableRow key={`${row.name}-${index}`} theme={theme}>
                              <TableCell theme={theme} $align="center">{row.name}</TableCell>
                              <TableCell theme={theme} $align="center">{row.total.toLocaleString()}</TableCell>
                              <TableCell theme={theme} $align="center">{row.solved.toLocaleString()}</TableCell>
                              <TableCell theme={theme} $align="center">{row.botTransfer.toLocaleString()}</TableCell>
                              <TableCell theme={theme} $align="center">{row.manualTransfer.toLocaleString()}</TableCell>
                              <TableCell theme={theme} $align="center">{row.deposits.toLocaleString()}</TableCell>
                              <TableCell theme={theme} $align="center">{row.wdStatus.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TableSectionTitle theme={theme} style={{ marginTop: 24 }}>Детализация по дням и проектам</TableSectionTitle>
                    <ChartSubtitle theme={theme} style={{ marginTop: -8, marginBottom: 12 }}>
                      Каждая строка — один день и один проект.
                    </ChartSubtitle>
                    <DetailTableToolbar>
                      <DaySelectLabel theme={theme}>День:</DaySelectLabel>
                      <DaySelect
                        theme={theme}
                        value={detailDayFilter}
                        onChange={(e) => setDetailDayFilter(e.target.value)}
                        aria-label="Выберите день"
                      >
                        <option value="">Все дни</option>
                        {uniqueDates.map((d) => (
                          <option key={d} value={d}>
                            {formatDisplayDate(d)}
                          </option>
                        ))}
                      </DaySelect>
                      {detailDayFilter && (
                        <ChartSubtitle theme={theme} style={{ margin: 0 }}>
                          Показано за {formatDisplayDate(detailDayFilter)} — {detailRows.length} строк
                        </ChartSubtitle>
                      )}
                    </DetailTableToolbar>
                    <TableContainer>
                    <Table theme={theme}>
                      <TableHeader theme={theme}>
                        <TableHeaderRow theme={theme}>
                          <TableHeaderCell theme={theme} $align="center">Дата</TableHeaderCell>
                          <TableHeaderCell theme={theme} $align="center">Проект</TableHeaderCell>
                          <TableHeaderCell theme={theme} $align="center">Всего чатов</TableHeaderCell>
                          <TableHeaderCell theme={theme} $align="center">Решено ботом</TableHeaderCell>
                          <TableHeaderCell theme={theme} $align="center">Переведено ботом</TableHeaderCell>
                          <TableHeaderCell theme={theme} $align="center">Переведено операторами</TableHeaderCell>
                          <TableHeaderCell theme={theme} $align="center">Депозиты</TableHeaderCell>
                          <TableHeaderCell theme={theme} $align="center">WD Status</TableHeaderCell>
                        </TableHeaderRow>
                      </TableHeader>
                      <TableBody>
                        {detailRows.map((row, index) => (
                          <TableRow key={`${row[0]}-${row[1] ?? 'n'}-${index}`} theme={theme}>
                            <TableCell theme={theme} $align="center">{formatDisplayDate(row[0])}</TableCell>
                            <TableCell theme={theme} $align="center">
                              {row[1] != null && row[1] !== '' ? row[1] : 'Не на ботах (VIP)'}
                            </TableCell>
                            <TableCell theme={theme} $align="center">
                              {row[2] ?? '—'}
                            </TableCell>
                            <TableCell theme={theme} $align="center">
                              {row[3] ?? '—'}
                            </TableCell>
                            <TableCell theme={theme} $align="center">
                              {row[4] ?? '—'}
                            </TableCell>
                            <TableCell theme={theme} $align="center">
                              {row[5] ?? '—'}
                            </TableCell>
                            <TableCell theme={theme} $align="center">
                              {row[6] ?? '—'}
                            </TableCell>
                            <TableCell theme={theme} $align="center">
                              {row[7] ?? '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  </>
                );
              })()
            ) : (
              <EmptyState theme={theme}>
                <EmptyStateText theme={theme}>Нет данных</EmptyStateText>
              </EmptyState>
            )}
          </ContentArea>
        </PageContent>
      </ThemeProvider>
    </Layout>
  );
};

