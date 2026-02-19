import { Routes, Route } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { DashboardPage } from '@/pages/dashboard-page'
import { ProjectsPage } from '@/pages/projects-page'
import { PipelinePage } from '@/pages/pipeline-page'
import { TemplatesPage } from '@/pages/templates-page'
import { UsagePage } from '@/pages/usage-page'
import { SettingsPage } from '@/pages/settings-page'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<PipelinePage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="usage" element={<UsagePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
