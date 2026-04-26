import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';
import type { AuthSettings } from '../types';
import Toggle from '../components/ui/Toggle';

type Section = 'auth' | 'mfa';

const authSettings = [
  {
    key: 'passkeysEnabled' as keyof AuthSettings,
    title: 'Passkeys',
    description:
      'Nutzer können sich mit einem Passkey anmelden. Wenn Passkeys registriert sind, werden Sie als alternative Anmeldeoption zu Passwörtern angezeigt.',
  },
  {
    key: 'passwordEnabled' as keyof AuthSettings,
    title: 'Passwort',
    description:
      'Nutzer können sich mit einem Passwort anmelden. Ein Passwort muss beim Registrieren zwingend eingestellt werden, es sei denn Social Accounts werden genutzt.',
  },
  {
    key: 'emailPasscodesEnabled' as keyof AuthSettings,
    title: 'E-Mail Passcodes',
    description: 'Nutzer erhalten einen Passcode per E-Mail, welcher zum Anmelden genutzt werden kann.',
  },
  {
    key: 'mobileNumberEnabled' as keyof AuthSettings,
    title: 'Mobilfunknummer',
    description: 'Nutzer erhalten einen Passcode per SMS, welcher zum Anmelden genutzt werden kann.',
  },
];

const mfaSettings = [
  {
    key: 'totpEnabled' as keyof AuthSettings,
    title: 'Einmalpasswörter (TOTP-App)',
    description:
      'Nutzer können eine TOTP-App per QR-Code registrieren und dann den dort angezeigten Code als zweiten Faktor nutzen.',
  },
  {
    key: 'mfaEmailEnabled' as keyof AuthSettings,
    title: 'E-Mail Passcodes',
    description:
      'Falls keine TOTP-App registriert ist, erhält der Nutzer einen Passcode per E-Mail, welcher als zweiter Faktor genutzt werden kann.',
  },
  {
    key: 'mfaSmsEnabled' as keyof AuthSettings,
    title: 'Mobilfunknummer',
    description:
      'Falls keine TOTP-App registriert ist, erhält der Nutzer einen Passcode per SMS, welcher als zweiter Faktor genutzt werden kann.',
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('auth');
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AuthSettings>) => settingsApi.update(data),
    // Optimistic update — update UI immediately, sync with server in background
    onMutate: async (newData) => {
      await qc.cancelQueries({ queryKey: ['settings'] });
      const previous = qc.getQueryData<AuthSettings>(['settings']);
      qc.setQueryData(['settings'], (old: AuthSettings) => ({ ...old, ...newData }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      qc.setQueryData(['settings'], context?.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleToggle = (key: keyof AuthSettings, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  const currentItems = activeSection === 'auth' ? authSettings : mfaSettings;
  const sectionTitle = activeSection === 'auth'
    ? 'Benutzer Authentifizierung'
    : 'Multifaktor Authentifizierung';

  return (
    <div className="flex h-full">
      {/* LEFT — navigation panel */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 text-right mb-3">
          Authentifizierungs Einstellungen
        </h2>
        {[
          { key: 'auth' as Section, label: 'Benutzer Authentifizierung' },
          { key: 'mfa' as Section, label: 'Multifaktor Authentifizierung' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`w-full text-right px-3 py-2 text-sm rounded transition-colors ${
              activeSection === key
                ? 'bg-gray-200 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* RIGHT — settings content */}
      <div className="flex-1 bg-gray-50 overflow-y-auto p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">{sectionTitle}</h2>

        {isLoading ? (
          <p className="text-sm text-gray-400">Laden...</p>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {currentItems.map(({ key, title, description }) => (
              <div key={key} className="bg-white rounded-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                  <Toggle
                    enabled={!!(settings?.[key])}
                    onChange={(val) => handleToggle(key, val)}
                  />
                </div>
                <p className="text-xs text-gray-500">{description}</p>

                {/* Extra sub-toggle for Passkeys — "Passwort löschen" */}
                {key === 'passkeysEnabled' && settings?.[key] && (
                  <div className="mt-3 flex items-center gap-2">
                    <Toggle enabled={false} onChange={() => {}} />
                    <span className="text-xs text-gray-500">Passwort löschen</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
