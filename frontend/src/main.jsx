import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeIndianRupee,
  CalendarDays,
  Edit3,
  Landmark,
  LogOut,
  PieChart,
  Plus,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  WalletCards,
  X
} from 'lucide-react';
import { api } from './services/api';
import './styles.css';

const emptyTransaction = { type: 'CREDIT', amount: '', category: '', note: '' };
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const shortMoney = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});
const quickCategories = ['Salary', 'Food', 'Travel', 'Shopping', 'Bills', 'Freelance', 'Rent', 'Investment'];
const fallbackTransactions = [
  { id: 'demo-1', type: 'CREDIT', amount: 85000, category: 'Salary', note: 'Monthly income', createdAt: new Date().toISOString() },
  { id: 'demo-2', type: 'DEBIT', amount: 12000, category: 'Rent', note: 'Apartment payment', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'demo-3', type: 'DEBIT', amount: 4200, category: 'Food', note: 'Weekend dining', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'demo-4', type: 'DEBIT', amount: 7500, category: 'Investment', note: 'SIP deposit', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'demo-5', type: 'CREDIT', amount: 22000, category: 'Freelance', note: 'Client milestone', createdAt: new Date(Date.now() - 345600000).toISOString() }
];

function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('fintrack-session') || 'null'));
  const [mode, setMode] = useState('login');
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', password: '' });
  const [wallet, setWallet] = useState({ balance: 0, recentTransactions: [] });
  const [transaction, setTransaction] = useState(emptyTransaction);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const token = session?.token;
  const transactions = wallet.recentTransactions.length ? wallet.recentTransactions : fallbackTransactions;

  useEffect(() => {
    if (token) {
      loadWallet(token);
    }
  }, [token]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (sum, item) => {
        const amount = Number(item.amount);
        return item.type === 'CREDIT'
          ? { ...sum, credit: sum.credit + amount }
          : { ...sum, debit: sum.debit + amount };
      },
      { credit: 0, debit: 0 }
    );
  }, [transactions]);

  const analytics = useMemo(() => buildAnalytics(transactions, totals), [transactions, totals]);

  const filteredTransactions = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) {
      return transactions;
    }

    return transactions.filter((item) => {
      return [item.type, item.category, item.note, String(item.amount)]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [search, transactions]);

  async function loadWallet(jwt = token) {
    const data = await api('/wallet', { token: jwt });
    setWallet(data);
  }

  async function submitAuth(event) {
    event.preventDefault();
    setMessage('');
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : authForm;
      const data = await api(path, { method: 'POST', body: payload });
      localStorage.setItem('fintrack-session', JSON.stringify(data));
      setSession(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitTransaction(event) {
    event.preventDefault();
    setMessage('');
    try {
      const path = editingId ? `/wallet/transactions/${editingId}` : '/wallet/transactions';
      await api(path, {
        method: editingId ? 'PUT' : 'POST',
        token,
        body: { ...transaction, amount: Number(transaction.amount) }
      });
      setTransaction(emptyTransaction);
      setEditingId(null);
      await loadWallet();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function startEdit(item) {
    if (String(item.id).startsWith('demo-')) {
      setMessage('Create your first real transaction to edit it.');
      return;
    }

    setEditingId(item.id);
    setTransaction({
      type: item.type,
      amount: String(item.amount),
      category: item.category,
      note: item.note
    });
    setMessage('');
  }

  function cancelEdit() {
    setEditingId(null);
    setTransaction(emptyTransaction);
    setMessage('');
  }

  function logout() {
    localStorage.removeItem('fintrack-session');
    setSession(null);
    setWallet({ balance: 0, recentTransactions: [] });
  }

  if (!session) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="auth-art">
            <div className="coin coin-a">₹</div>
            <div className="coin coin-b">₹</div>
            <WalletCards size={46} />
          </div>
          <div className="brand-row auth-brand">
            <div>
              <h1>FinTrack Wallet</h1>
              <p>Track money, spot patterns, correct mistakes fast.</p>
            </div>
          </div>
          <div className="segmented">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          </div>
          <form onSubmit={submitAuth} className="form-grid">
            {mode === 'register' && (
              <input placeholder="Full name" value={authForm.fullName} onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })} />
            )}
            <input placeholder="Email" type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
            <input placeholder="Password" type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
            <button className="primary" type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
          </form>
          {message && <p className="message">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-row">
          <div className="brand-mark"><WalletCards size={24} /></div>
          <div>
            <h1>FinTrack Wallet</h1>
            <p>{session.fullName} · {session.email}</p>
          </div>
        </div>
        <div className="top-actions">
          <span><CalendarDays size={16} /> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <button className="icon-button" onClick={logout} title="Logout"><LogOut size={18} /></button>
        </div>
      </header>

      <section className="hero-dashboard">
        <article className="balance-card">
          <div className="balance-top">
            <span><Sparkles size={16} /> Live wallet balance</span>
            <BadgeIndianRupee size={30} />
          </div>
          <strong>{money.format(Number(wallet.balance || analytics.netWorth))}</strong>
          <p>{analytics.savingsRate}% savings rate based on recent activity</p>
          <div className="balance-wave">
            <span style={{ height: '36%' }} />
            <span style={{ height: '68%' }} />
            <span style={{ height: '44%' }} />
            <span style={{ height: '82%' }} />
            <span style={{ height: '55%' }} />
            <span style={{ height: '76%' }} />
            <span style={{ height: '48%' }} />
          </div>
        </article>

        <article className="insight-card">
          <div className="insight-icon income"><TrendingUp size={20} /></div>
          <span>Income</span>
          <strong>{money.format(totals.credit)}</strong>
          <p>{analytics.creditCount} credit entries</p>
        </article>

        <article className="insight-card">
          <div className="insight-icon expense"><TrendingDown size={20} /></div>
          <span>Expenses</span>
          <strong>{money.format(totals.debit)}</strong>
          <p>{analytics.debitCount} debit entries</p>
        </article>

        <article className="insight-card">
          <div className="insight-icon neutral"><Landmark size={20} /></div>
          <span>Net Flow</span>
          <strong>{money.format(totals.credit - totals.debit)}</strong>
          <p>{transactions.length} tracked records</p>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <span>Cashflow</span>
              <h2>Income vs Expenses</h2>
            </div>
            <PieChart size={22} />
          </div>
          <CashflowBars income={totals.credit} expense={totals.debit} />
        </article>

        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <span>Trend</span>
              <h2>Recent Balance Movement</h2>
            </div>
          </div>
          <BalanceLine points={analytics.timeline} />
        </article>

        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <span>Categories</span>
              <h2>Top Spending Areas</h2>
            </div>
          </div>
          <CategoryBars categories={analytics.categories} />
        </article>
      </section>

      <section className="workspace-grid">
        <form className="transaction-form panel" onSubmit={submitTransaction}>
          <div className="form-title">
            <div>
              <span>Action center</span>
              <h2>{editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
            </div>
            {editingId && <button className="ghost-icon" type="button" onClick={cancelEdit} title="Cancel edit"><X size={17} /></button>}
          </div>
          <div className="type-toggle">
            <button type="button" className={transaction.type === 'CREDIT' ? 'selected' : ''} onClick={() => setTransaction({ ...transaction, type: 'CREDIT' })}>
              <ArrowDownCircle size={18} /> Credit
            </button>
            <button type="button" className={transaction.type === 'DEBIT' ? 'selected' : ''} onClick={() => setTransaction({ ...transaction, type: 'DEBIT' })}>
              <ArrowUpCircle size={18} /> Debit
            </button>
          </div>
          <input placeholder="Amount in INR" type="number" min="0.01" step="0.01" value={transaction.amount} onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })} />
          <input placeholder="Category" value={transaction.category} onChange={(e) => setTransaction({ ...transaction, category: e.target.value })} />
          <div className="chips">
            {quickCategories.map((category) => (
              <button key={category} type="button" onClick={() => setTransaction({ ...transaction, category })}>{category}</button>
            ))}
          </div>
          <input placeholder="Note" value={transaction.note} onChange={(e) => setTransaction({ ...transaction, note: e.target.value })} />
          <button className="primary" type="submit">
            {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
            {editingId ? 'Save changes' : 'Add transaction'}
          </button>
          {message && <p className="message">{message}</p>}
        </form>

        <section className="history panel">
          <div className="history-head">
            <div>
              <span>Ledger</span>
              <h2>Transactions</h2>
            </div>
            <div className="search-box">
              <Search size={17} />
              <input placeholder="Search category, note, amount" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table">
            {filteredTransactions.map((item, index) => (
              <div className="row" key={item.id} style={{ animationDelay: `${index * 45}ms` }}>
                <span className={item.type === 'CREDIT' ? 'pill credit' : 'pill debit'}>{item.type}</span>
                <div>
                  <strong>{item.category}</strong>
                  <small>{item.note}</small>
                </div>
                <span>{new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
                <strong className={item.type === 'CREDIT' ? 'amount-positive' : 'amount-negative'}>
                  {item.type === 'CREDIT' ? '+' : '-'}{money.format(Number(item.amount))}
                </strong>
                <button className="icon-button" onClick={() => startEdit(item)} title="Edit transaction"><Edit3 size={16} /></button>
              </div>
            ))}
            {filteredTransactions.length === 0 && <p className="empty">No transactions found.</p>}
          </div>
        </section>
      </section>
    </main>
  );
}

function buildAnalytics(items, totals) {
  const creditCount = items.filter((item) => item.type === 'CREDIT').length;
  const debitCount = items.filter((item) => item.type === 'DEBIT').length;
  const netWorth = totals.credit - totals.debit;
  const savingsRate = totals.credit ? Math.max(0, Math.round(((totals.credit - totals.debit) / totals.credit) * 100)) : 0;
  const categoryMap = items
    .filter((item) => item.type === 'DEBIT')
    .reduce((map, item) => map.set(item.category, (map.get(item.category) || 0) + Number(item.amount)), new Map());
  const maxCategory = Math.max(1, ...categoryMap.values());
  const categories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value, percent: Math.round((value / maxCategory) * 100) }));
  let running = 0;
  const timeline = [...items]
    .reverse()
    .slice(-8)
    .map((item) => {
      running += item.type === 'CREDIT' ? Number(item.amount) : -Number(item.amount);
      return running;
    });

  return { categories, creditCount, debitCount, netWorth, savingsRate, timeline };
}

function CashflowBars({ income, expense }) {
  const max = Math.max(income, expense, 1);
  return (
    <div className="cash-bars">
      <div>
        <span>{shortMoney.format(income)}</span>
        <div className="bar-track"><i className="income-bar" style={{ width: `${Math.max(8, (income / max) * 100)}%` }} /></div>
        <small>Money In</small>
      </div>
      <div>
        <span>{shortMoney.format(expense)}</span>
        <div className="bar-track"><i className="expense-bar" style={{ width: `${Math.max(8, (expense / max) * 100)}%` }} /></div>
        <small>Money Out</small>
      </div>
    </div>
  );
}

function BalanceLine({ points }) {
  const safePoints = points.length ? points : [0, 10, 6, 18, 14, 24, 20, 30];
  const min = Math.min(...safePoints);
  const max = Math.max(...safePoints);
  const range = max - min || 1;
  const coordinates = safePoints.map((point, index) => {
    const x = (index / Math.max(1, safePoints.length - 1)) * 100;
    const y = 70 - ((point - min) / range) * 50;
    return `${x},${y}`;
  });

  return (
    <svg className="line-chart" viewBox="0 0 100 80" role="img" aria-label="Recent balance movement">
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline className="line-fill" points={`0,80 ${coordinates.join(' ')} 100,80`} />
      <polyline className="line-stroke" points={coordinates.join(' ')} />
      {coordinates.map((point) => {
        const [x, y] = point.split(',');
        return <circle key={point} cx={x} cy={y} r="1.8" />;
      })}
    </svg>
  );
}

function CategoryBars({ categories }) {
  if (!categories.length) {
    return <p className="empty">Add debit transactions to unlock category insights.</p>;
  }

  return (
    <div className="category-bars">
      {categories.map((category) => (
        <div className="category-row" key={category.name}>
          <div>
            <strong>{category.name}</strong>
            <span>{shortMoney.format(category.value)}</span>
          </div>
          <div className="bar-track"><i style={{ width: `${category.percent}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
