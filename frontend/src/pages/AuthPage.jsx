import { useState } from 'react';
import { login, register } from '../services/authService';

const PASSWORD_RULES = [
  { label: 'En az 8 karakter', test: (p) => p.length >= 8 },
  { label: 'En az 1 büyük harf (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'En az 1 küçük harf (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'En az 1 rakam (0-9)', test: (p) => /[0-9]/.test(p) },
];

function passwordIsValid(password) {
  return PASSWORD_RULES.every((r) => r.test(password));
}

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    university: '',
    department: '',
  });
  const [touched, setTouched] = useState({ password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function switchTab(newTab) {
    setTab(newTab);
    setError('');
    setTouched({ password: false });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (tab === 'register' && !passwordIsValid(form.password)) {
      setError('Şifre tüm gereksinimleri karşılamalıdır.');
      setTouched({ password: true });
      return;
    }

    setLoading(true);
    try {
      const user =
        tab === 'login'
          ? await login(form.email, form.password)
          : await register(form.fullName, form.email, form.password, form.university, form.department);
      onAuth(user);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail) {
        setError(detail);
      } else if (!err.response) {
        setError('Sunucuya bağlanılamadı. Backend çalışıyor mu?');
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  }

  const showRules = tab === 'register' && (touched.password || form.password.length > 0);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <svg className="icon auth-logo" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15zM4 4.5v15"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <div>
            <strong>StudyGroup</strong>
            <small>Collaborative workspace</small>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            type="button"
            onClick={() => switchTab('login')}
          >
            Giriş Yap
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            type="button"
            onClick={() => switchTab('register')}
          >
            Kayıt Ol
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <label className="field">
              <span>Ad Soyad</span>
              <input
                required
                placeholder="Adınız Soyadınız"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
              />
            </label>
          )}

          <label className="field">
            <span>E-posta</span>
            <input
              required
              type="email"
              placeholder="ornek@mail.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </label>

          <label className="field">
            <span>Şifre</span>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              onBlur={() => tab === 'register' && setTouched({ password: true })}
            />
          </label>

          {showRules && (
            <div className="password-rules">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(form.password);
                return (
                  <div key={rule.label} className={`pw-rule ${ok ? 'pw-ok' : 'pw-fail'}`}>
                    <span className="pw-icon">{ok ? '✓' : '✗'}</span>
                    <span>{rule.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'register' && !showRules && (
            <div className="password-hint">
              <span>Şifre gereksinimleri: 8+ karakter, büyük/küçük harf ve rakam içermeli</span>
            </div>
          )}

          {tab === 'register' && (
            <>
              <label className="field">
                <span>Üniversite</span>
                <input
                  required
                  placeholder="İstanbul Teknik Üniversitesi"
                  value={form.university}
                  onChange={(e) => set('university', e.target.value)}
                />
              </label>
              <label className="field">
                <span>Bölüm</span>
                <input
                  required
                  placeholder="Bilgisayar Mühendisliği"
                  value={form.department}
                  onChange={(e) => set('department', e.target.value)}
                />
              </label>
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button className="primary-button full" type="submit" disabled={loading}>
            {loading ? 'Lütfen bekleyin…' : tab === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </button>
        </form>
      </div>
    </div>
  );
}
