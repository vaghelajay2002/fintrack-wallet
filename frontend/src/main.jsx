import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDownCircle, ArrowUpCircle, LogOut, Plus, WalletCards } from 'lucide-react';
import { api } from './services/api';
import './styles.css';

function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('fintrack-session') || 'null'));
  const [mode, setMode] = useState('login');
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', password: '' });
  const [wallet, setWallet] = useState({ balance: 0, recentTransactions: [] });
  const [transaction, setTransaction] = useState({ type: 'CREDIT', amount: '', category: '', note: '' });
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
      await api('/wallet/transactions', {
        method: 'POST',
        token,
        body: { ...transaction, amount: Number(transaction.amount) }
      });
      setTransaction({ type: 'CREDIT', amount: '', category: '', note: '' });
      await loadWallet();
    } catch (error) {
      setMessage(error.message);
    }
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
          <strong>${Number(wallet.balance).toFixed(2)}</strong>
        </article>
        <article className="metric">
          <span>Income</span>
          <strong>${totals.credit.toFixed(2)}</strong>
        </article>
        <article className="metric">
          <span>Expenses</span>
          <strong>${totals.debit.toFixed(2)}</strong>
        </article>
      </section>

      <section className="content-grid">
        <form className="transaction-form" onSubmit={submitTransaction}>
          <h2>New Transaction</h2>
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
          <input placeholder="Note" value={transaction.note} onChange={(e) => setTransaction({ ...transaction, note: e.target.value })} />
          <button className="primary" type="submit"><Plus size={18} /> Add transaction</button>
          {message && <p className="message">{message}</p>}
        </form>

        <section className="history">
          <h2>Recent Transactions</h2>
          <div className="table">
            {wallet.recentTransactions.map((item) => (
              <div className="row" key={item.id}>
                <span className={item.type === 'CREDIT' ? 'pill credit' : 'pill debit'}>{item.type}</span>
                <span>{item.category}</span>
                <span>{item.note}</span>
                <strong>{item.type === 'CREDIT' ? '+' : '-'}${Number(item.amount).toFixed(2)}</strong>
              </div>
            ))}
            {wallet.recentTransactions.length === 0 && <p className="empty">No transactions yet.</p>}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
