import { useState } from 'react';
import { Settings as SettingsIcon, Wallet } from 'lucide-react';
import { useSettings, useSheetData } from './hooks/useSheetData';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';

function WelcomeScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">
          <Wallet size={64} />
        </div>
        <h1 className="welcome-title">家計簿ダッシュボード</h1>
        <p className="welcome-description">
          Googleスプレッドシートのデータを美しく可視化し、
          <br />
          家計管理をサポートします。
        </p>
        
        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>月別収支グラフ</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🥧</span>
            <span>カテゴリ別分析</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <span>トレンド把握</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔄</span>
            <span>リアルタイム更新</span>
          </div>
        </div>

        <button className="btn btn-primary btn-large" onClick={onOpenSettings}>
          <SettingsIcon size={20} />
          スプレッドシートを接続
        </button>

        <p className="welcome-hint">
          ※ スプレッドシートを「ウェブに公開」してから接続してください
        </p>
      </div>

      <style>{`
        .welcome-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .welcome-content {
          text-align: center;
          max-width: 520px;
          animation: fadeIn 0.6s ease;
        }

        .welcome-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          background: var(--gradient-primary);
          border-radius: 32px;
          margin-bottom: 32px;
          color: #0f1419;
          box-shadow: var(--shadow-glow);
        }

        .welcome-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 16px;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-description {
          font-size: 1.1rem;
          color: var(--color-text-secondary);
          line-height: 1.8;
          margin-bottom: 40px;
        }

        .welcome-features {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
        }

        .feature-item:hover {
          border-color: var(--color-accent-primary);
          background: var(--color-bg-hover);
        }

        .feature-icon {
          font-size: 1.5rem;
        }

        .btn-large {
          padding: 16px 32px;
          font-size: 1.1rem;
        }

        .welcome-hint {
          margin-top: 24px;
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        @media (max-width: 600px) {
          .welcome-title {
            font-size: 1.75rem;
          }

          .welcome-description {
            font-size: 1rem;
          }

          .welcome-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [settings, setSettings] = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const { expenses, incomes, loading, error, lastUpdated, refetch } = useSheetData(settings);

  const hasValidSettings = settings?.spreadsheetId;

  return (
    <>
      {/* ナビゲーション（設定済みの場合のみ表示） */}
      {hasValidSettings && (
        <nav className="nav">
          <div className="nav-brand">
            <Wallet size={24} />
            <span>家計簿ダッシュボード</span>
          </div>
          <button
            className="nav-settings-btn"
            onClick={() => setShowSettings(true)}
            title="設定"
          >
            <SettingsIcon size={20} />
          </button>
        </nav>
      )}

      {/* メインコンテンツ */}
      {hasValidSettings ? (
        <Dashboard
          expenses={expenses}
          incomes={incomes}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
        />
      ) : (
        <WelcomeScreen onOpenSettings={() => setShowSettings(true)} />
      )}

      {/* 設定モーダル */}
      {showSettings && (
        <Settings
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <style>{`
        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(15, 20, 25, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--color-border);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .nav-brand svg {
          color: var(--color-accent-primary);
        }

        .nav-settings-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .nav-settings-btn:hover {
          background: var(--color-bg-hover);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }

        @media (max-width: 600px) {
          .nav {
            padding: 12px 16px;
          }

          .nav-brand span {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
