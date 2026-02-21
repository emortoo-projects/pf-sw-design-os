"use client";

import { useState } from "react";

type SettingsSection = "profile" | "credentials" | "webhooks" | "preferences";

const sections: { id: SettingsSection; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "credentials", label: "API Credentials" },
  { id: "webhooks", label: "Webhooks" },
  { id: "preferences", label: "Preferences" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile, credentials, webhooks, and preferences
          </p>
        </div>

        <div className="mt-8 flex gap-8">
          {/* Navigation */}
          <nav className="w-48 flex-shrink-0">
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
                <p className="mt-1 text-sm text-gray-500">Update your account information</p>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="mt-1 w-full max-w-md rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 w-full max-w-md rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>
                  <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Credentials Section */}
            {activeSection === "credentials" && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">API Credentials</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage API keys for AI providers
                      </p>
                    </div>
                    <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                      Add Credential
                    </button>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">No credentials configured</p>
                  </div>
                </div>
              </div>
            )}

            {/* Webhooks Section */}
            {activeSection === "webhooks" && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Webhooks</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure webhook endpoints for event notifications
                    </p>
                  </div>
                  <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Add Webhook
                  </button>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-500">No webhooks configured</p>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === "preferences" && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
                <p className="mt-1 text-sm text-gray-500">Customize your experience</p>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive email alerts for important events</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors">
                      <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                      <p className="text-xs text-gray-500">Use dark theme across the application</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors">
                      <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Auto-refresh Dashboard</p>
                      <p className="text-xs text-gray-500">Automatically refresh data every 30 seconds</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors">
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Default Time Zone</label>
                    <select className="mt-1 w-full max-w-md rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Berlin">Berlin</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
