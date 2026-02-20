import { Routes, Route } from 'react-router'
import { AuthLayout } from '@/components/layout/auth-layout'
import { RequireAuth } from '@/components/layout/require-auth'
import { AppShell } from '@/components/layout/app-shell'
import { LoginPage } from '@/pages/login-page'
import { RegisterPage } from '@/pages/register-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { ProjectsPage } from '@/pages/projects-page'
import { PipelinePage } from '@/pages/pipeline-page'
import { TemplatesPage } from '@/pages/templates-page'
import { UsagePage } from '@/pages/usage-page'
import { SettingsPage } from '@/pages/settings-page'
import { SetupPage } from '@/pages/setup-page'

export function App() {
  return (
    <Routes>
      {/* Setup wizard — standalone, no auth */}
      <Route path="setup" element={<SetupPage />} />

      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Protected app routes */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<PipelinePage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="usage" element={<UsagePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
