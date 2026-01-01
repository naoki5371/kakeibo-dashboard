import { useState, useEffect, useCallback } from 'react';
import type { ExpenseRecord, IncomeRecord, AppSettings } from '../types';
import { fetchExpenseData, fetchIncomeData, extractSpreadsheetId } from '../utils/googleSheets';

interface UseSheetDataReturn {
  expenses: ExpenseRecord[];
  incomes: IncomeRecord[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

const SETTINGS_KEY = 'kakeibo-settings';

export function useSettings(): [AppSettings | null, (settings: AppSettings) => void] {
  const [settings, setSettingsState] = useState<AppSettings | null>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const setSettings = useCallback((newSettings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    setSettingsState(newSettings);
  }, []);

  return [settings, setSettings];
}

export function useSheetData(settings: AppSettings | null): UseSheetDataReturn {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!settings?.spreadsheetId) {
      setError('スプレッドシートIDが設定されていません');
      return;
    }

    const spreadsheetId = extractSpreadsheetId(settings.spreadsheetId) || settings.spreadsheetId;

    setLoading(true);
    setError(null);

    try {
      const [expenseData, incomeData] = await Promise.all([
        fetchExpenseData(spreadsheetId, settings.expenseSheetName || '家計簿【支出】（回答）'),
        fetchIncomeData(spreadsheetId, settings.incomeSheetName || '家計簿【収入】（回答）'),
      ]);

      setExpenses(expenseData);
      setIncomes(incomeData);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの取得に失敗しました';
      setError(errorMessage);
      console.error('Failed to fetch sheet data:', err);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    if (settings?.spreadsheetId) {
      fetchData();
    }
  }, [settings?.spreadsheetId, settings?.expenseSheetName, settings?.incomeSheetName, fetchData]);

  return {
    expenses,
    incomes,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}

