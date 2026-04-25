import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

interface FormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!form.username.trim()) newErrors.username = 'Benutzername ist erforderlich';
    if (!form.email.trim()) newErrors.email = 'E-Mail ist erforderlich';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Ungültige E-Mail-Adresse';
    if (!form.password) newErrors.password = 'Passwort ist erforderlich';
    else if (form.password.length < 6)
      newErrors.password = 'Mindestens 6 Zeichen';
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setServerError('');
    setLoading(true);
    try {
      const data = await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
      });
      setAuth(data.accessToken, data.user);
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setServerError(
        Array.isArray(msg)
          ? msg.join(', ')
          : msg ?? 'Registrierung fehlgeschlagen. Bitte erneut versuchen.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <p className="text-center text-gray-500 text-sm mb-1">Willkommen</p>
        <h1 className="text-center text-3xl font-light text-gray-800 mb-6">Registrieren</h1>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Vorname</label>
            <input
              type="text"
              value={form.firstName}
              onChange={set('firstName')}
              onKeyDown={handleKeyDown}
              placeholder="Max"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nachname</label>
            <input
              type="text"
              value={form.lastName}
              onChange={set('lastName')}
              onKeyDown={handleKeyDown}
              placeholder="Mustermann"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Username */}
        <Field
          label="Benutzername"
          value={form.username}
          onChange={set('username')}
          onKeyDown={handleKeyDown}
          placeholder="maxmuster"
          error={errors.username}
        />

        {/* Email */}
        <Field
          label="E-Mail"
          type="email"
          value={form.email}
          onChange={set('email')}
          onKeyDown={handleKeyDown}
          placeholder="max@example.com"
          error={errors.email}
        />

        {/* Password */}
        <Field
          label="Passwort"
          type="password"
          value={form.password}
          onChange={set('password')}
          onKeyDown={handleKeyDown}
          placeholder="••••••••"
          error={errors.password}
        />

        {/* Confirm password */}
        <Field
          label="Passwort bestätigen"
          type="password"
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          onKeyDown={handleKeyDown}
          placeholder="••••••••"
          error={errors.confirmPassword}
        />

        {serverError && (
          <p className="text-red-500 text-xs mb-3 -mt-1">{serverError}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 mt-1"
        >
          {loading ? 'Wird registriert...' : 'Registrieren'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Bereits ein Konto?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Hier anmelden
          </Link>
        </p>

        {/* Divider + Google placeholder */}
        <div className="flex items-center my-4 gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">ODER</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-2.5 text-sm text-blue-500 hover:bg-gray-50 transition-colors">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
      </div>
    </div>
  );
}

// Reusable field component — keeps the JSX above clean
interface FieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}

function Field({ label, value, onChange, onKeyDown, placeholder, type = 'text', error }: FieldProps) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
