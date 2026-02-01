import { useState } from 'react'
import { MoonIcon, SunIcon, BellIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline'

import { useChartStore } from '@stores/chartStore'

export default function SettingsPage() {
  const { theme, toggleTheme } = useChartStore()
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    newsAlerts: false,
    tradeNotifications: true,
  })
  const [apiKey, setApiKey] = useState('trk_live_xxxxxxxxxxxxxxxx')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Appearance */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            {theme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            <h2 className="text-lg font-medium">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-gray-400">Choose your preferred theme</div>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 bg-trading-bg-tertiary rounded hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
              {theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <BellIcon className="w-5 h-5" />
            <h2 className="text-lg font-medium">Notifications</h2>
          </div>
          <div className="space-y-4">
            <ToggleSetting
              label="Price Alerts"
              description="Get notified when price reaches your target"
              enabled={notifications.priceAlerts}
              onChange={(v) => setNotifications({ ...notifications, priceAlerts: v })}
            />
            <ToggleSetting
              label="News Alerts"
              description="Get notified about important news"
              enabled={notifications.newsAlerts}
              onChange={(v) => setNotifications({ ...notifications, newsAlerts: v })}
            />
            <ToggleSetting
              label="Trade Notifications"
              description="Get notified about your trades"
              enabled={notifications.tradeNotifications}
              onChange={(v) => setNotifications({ ...notifications, tradeNotifications: v })}
            />
          </div>
        </section>

        {/* API */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheckIcon className="w-5 h-5" />
            <h2 className="text-lg font-medium">API Access</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  readOnly
                  className="input flex-1"
                />
                <button className="btn btn-secondary">Regenerate</button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rate Limit</label>
              <div className="text-sm">1000 requests per minute</div>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCircleIcon className="w-5 h-5" />
            <h2 className="text-lg font-medium">Account</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-gray-400">user@example.com</div>
              </div>
              <button className="btn btn-secondary">Change</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Password</div>
                <div className="text-sm text-gray-400">Last changed 30 days ago</div>
              </div>
              <button className="btn btn-secondary">Change</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-gray-400">Not enabled</div>
              </div>
              <button className="btn btn-secondary">Enable</button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="card p-6 border-red-500/30">
          <h2 className="text-lg font-medium text-red-500 mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Delete Account</div>
              <div className="text-sm text-gray-400">This action cannot be undone</div>
            </div>
            <button className="btn btn-danger">Delete Account</button>
          </div>
        </section>
      </div>
    </div>
  )
}

interface ToggleSettingProps {
  label: string
  description: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}

function ToggleSetting({ label, description, enabled, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-trading-accent' : 'bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}
