import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDownCircle, ArrowUpCircle, Edit3, LogOut, Plus, Search, WalletCards, X } from 'lucide-react';
import { api } from './services/api';
import './styles.css';

const emptyTransaction = { type: 'CREDIT', amount: '', category: '', note: '' };
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const quickCategories = ['Salary', 'Food', 'Travel', 'Shopping', 'Bills', 'Freelance'];

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

  useEffect(() => {
    if (token) {
      loadWallet(token);
    }
  }, [token]);

  const totals = useMemo(() => {
    return wallet.recentTransactions.reduce(
      (sum, item) => {
        const amount = Number(item.amount);
        return item.type === 'CREDIT'
          ? { ...sum, credit: sum.credit + amount }
          : { ...sum, debit: sum.debit + amount };
      },
      { credit: 0, debit: 0 }
    );
  }, [wallet.recentTransactions]);

  const filteredTransactions = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) {
      return wallet.recentTransactions;
    }

    return wallet.recentTransactions.filter((item) => {
      return [item.type, item.category, item.note, String(item.amount)]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [search, wallet.recentTransactions]);

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
          <div className="brand-row">
            <WalletCards size={32} />
            <div>
              <h1>FinTrack Wallet</h1>
              <p>Java + React wallet portfolio project</p>
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
          <WalletCards size={30} />
          <div>
            <h1>FinTrack Wallet</h1>
            <p>{session.fullName} · {session.email}</p>
          </div>
        </div>
        <button className="icon-button" onClick={logout} title="Logout"><LogOut size={18} /></button>
      </header>

      <section className="metrics-grid">
        <article className="metric balance">
          <span>Balance</span>
          <strong>{money.format(Number(wallet.balance))}</strong>
        </article>
        <article className="metric">
          <span>Income</span>
          <strong>{money.format(totals.credit)}</strong>
        </article>
        <article className="metric">
          <span>Expenses</span>
          <strong>{money.format(totals.debit)}</strong>
        </article>
      </section>

      <section className="content-grid">
        <form className="transaction-form" onSubmit={submitTransaction}>
          <div className="form-title">
            <h2>{editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
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
          <input placeholder="Amount" type="number" min="0.01" step="0.01" value={transaction.amount} onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })} />
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

        <section className="history">
          <div className="history-head">
            <h2>Transactions</h2>
            <div className="search-box">
              <Search size={17} />
              <input placeholder="Search category, note, amount" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table">
            {filteredTransactions.map((item) => (
              <div className="row" key={item.id}>
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

createRoot(document.getElementById('root')).render(<App />);
