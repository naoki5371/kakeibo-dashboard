import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Link, FileSpreadsheet, Save, X } from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings | null;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export function Settings({ settings, onSave, onClose }: SettingsProps) {
  const [spreadsheetId, setSpreadsheetId] = useState(settings?.spreadsheetId || '');
  const [expenseSheetName, setExpenseSheetName] = useState(settings?.expenseSheetName || '支出');
  const [incomeSheetName, setIncomeSheetName] = useState(settings?.incomeSheetName || '収入');

  useEffect(() => {
    if (settings) {
      setSpreadsheetId(settings.spreadsheetId);
      setExpenseSheetName(settings.expenseSheetName);
      setIncomeSheetName(settings.incomeSheetName);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      spreadsheetId,
      expenseSheetName,
      incomeSheetName,
    });
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title">
            <SettingsIcon size={24} />
            <h2>設定</h2>
          </div>
          <button className="settings-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <h3>
              <Link size={18} />
              Googleスプレッドシート接続
            </h3>
            <p className="settings-description">
              スプレッドシートを「ウェブに公開」してから、URLまたはIDを入力してください。
            </p>
            
            <div className="settings-instructions">
              <h4>設定手順</h4>
              <ol>
                <li>Googleスプレッドシートを開く</li>
                <li>「ファイル」→「共有」→「ウェブに公開」を選択</li>
                <li>「公開」ボタンをクリック</li>
                <li>スプレッドシートのURLをコピーして下に貼り付け</li>
              </ol>
            </div>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="spreadsheetId">
              スプレッドシートURL または ID
            </label>
            <input
              id="spreadsheetId"
              type="text"
              className="input"
              value={spreadsheetId}
              onChange={e => setSpreadsheetId(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/xxxxx/edit"
            />
          </div>

          <div className="settings-section">
            <h3>
              <FileSpreadsheet size={18} />
              シート名
            </h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="expenseSheet">
                支出シート名
              </label>
              <input
                id="expenseSheet"
                type="text"
                className="input"
                value={expenseSheetName}
                onChange={e => setExpenseSheetName(e.target.value)}
                placeholder="支出"
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="incomeSheet">
                収入シート名
              </label>
              <input
                id="incomeSheet"
                type="text"
                className="input"
                value={incomeSheetName}
                onChange={e => setIncomeSheetName(e.target.value)}
                placeholder="収入"
              />
            </div>
          </div>

          <div className="settings-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              保存
            </button>
          </div>
        </form>

        <style>{`
          .settings-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.2s ease;
          }

          .settings-modal {
            width: 100%;
            max-width: 520px;
            max-height: 90vh;
            overflow-y: auto;
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-xl);
            animation: slideUp 0.3s ease;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .settings-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--color-border);
          }

          .settings-title {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .settings-title svg {
            color: var(--color-accent-primary);
          }

          .settings-title h2 {
            font-size: 1.25rem;
            font-weight: 600;
          }

          .settings-close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: transparent;
            border: none;
            border-radius: var(--radius-md);
            color: var(--color-text-secondary);
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .settings-close:hover {
            background: var(--color-bg-hover);
            color: var(--color-text-primary);
          }

          .settings-modal form {
            padding: 24px;
          }

          .settings-section {
            margin-bottom: 20px;
          }

          .settings-section h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--color-text-primary);
            margin-bottom: 8px;
          }

          .settings-section h3 svg {
            color: var(--color-accent-secondary);
          }

          .settings-description {
            font-size: 0.875rem;
            color: var(--color-text-muted);
            line-height: 1.5;
          }

          .settings-instructions {
            margin-top: 16px;
            padding: 16px;
            background: var(--color-bg-primary);
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border);
          }

          .settings-instructions h4 {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--color-accent-primary);
            margin-bottom: 12px;
          }

          .settings-instructions ol {
            padding-left: 20px;
            font-size: 0.85rem;
            color: var(--color-text-secondary);
          }

          .settings-instructions li {
            margin-bottom: 6px;
            line-height: 1.5;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .settings-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid var(--color-border);
          }
        `}</style>
      </div>
    </div>
  );
}

