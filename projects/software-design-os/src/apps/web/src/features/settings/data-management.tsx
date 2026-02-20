import { useState, useRef } from 'react'
import { Download, Upload, FileArchive, Database, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  useExportData,
  useImportData,
  useImportSdp,
  useDbStatus,
  useResetDatabase,
} from '@/hooks/use-data-management'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function DataManagement() {
  const exportData = useExportData()
  const importData = useImportData()
  const importSdp = useImportSdp()
  const { data: dbStatus, isLoading: dbLoading } = useDbStatus()
  const resetDb = useResetDatabase()

  const jsonInputRef = useRef<HTMLInputElement>(null)
  const sdpInputRef = useRef<HTMLInputElement>(null)
  const [jsonError, setJsonError] = useState<string | null>(null)

  const [resetConfirm, setResetConfirm] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleJsonImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setJsonError(null)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      importData.mutate(data)
    } catch {
      setJsonError('Invalid JSON file. Please select a valid export file.')
    }
    e.target.value = ''
  }

  const handleSdpImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    importSdp.mutate(file)
    e.target.value = ''
  }

  const handleReset = () => {
    if (resetConfirm !== 'RESET') return
    resetDb.mutate('RESET', {
      onSuccess: () => {
        setShowResetDialog(false)
        setResetConfirm('')
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-zinc-500">
            Download a copy of all your data for backup or migration.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData.mutate('json')}
              disabled={exportData.isPending}
            >
              {exportData.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData.mutate('sql')}
              disabled={exportData.isPending}
            >
              Export SQL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Upload className="h-4 w-4" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-zinc-500">
            Import data from a previous export. This will replace all existing data.
          </p>
          <div className="flex gap-2">
            <input ref={jsonInputRef} type="file" accept=".json" className="hidden" onChange={handleJsonImport} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => jsonInputRef.current?.click()}
              disabled={importData.isPending}
            >
              {importData.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Import JSON
            </Button>
          </div>
          {importData.isSuccess && (
            <p className="mt-2 text-xs text-emerald-600">
              Imported {importData.data.tablesImported} tables successfully.
            </p>
          )}
          {(importData.isError || jsonError) && (
            <p className="mt-2 text-xs text-red-600">
              {jsonError ?? importData.error?.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* SDP Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileArchive className="h-4 w-4" />
            Import SDP Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-zinc-500">
            Import a Software Design Package (.zip) to create a new project with all stages pre-filled.
          </p>
          <input ref={sdpInputRef} type="file" accept=".zip" className="hidden" onChange={handleSdpImport} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => sdpInputRef.current?.click()}
            disabled={importSdp.isPending}
          >
            {importSdp.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Upload .zip
          </Button>
          {importSdp.isSuccess && (
            <p className="mt-2 text-xs text-emerald-600">
              Project "{importSdp.data.projectName}" created with {importSdp.data.stagesImported} stages.
            </p>
          )}
          {importSdp.isError && (
            <p className="mt-2 text-xs text-red-600">{importSdp.error.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dbLoading || !dbStatus ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Database Size</span>
                  <p className="font-medium text-zinc-900">{formatBytes(dbStatus.sizeBytes)}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Last Backup</span>
                  <p className="font-medium text-zinc-900">
                    {dbStatus.lastBackup
                      ? new Date(dbStatus.lastBackup).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-sm text-zinc-500">Tables</span>
                <div className="mt-1 rounded-md border border-zinc-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-left">
                        <th className="px-3 py-1.5 font-medium text-zinc-500">Table</th>
                        <th className="px-3 py-1.5 text-right font-medium text-zinc-500">Rows</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbStatus.tables.map((t) => (
                        <tr key={t.name} className="border-b border-zinc-50 last:border-0">
                          <td className="px-3 py-1.5 text-zinc-700">{t.name}</td>
                          <td className="px-3 py-1.5 text-right text-zinc-600">{t.rowCount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showResetDialog ? (
            <>
              <p className="mb-3 text-sm text-zinc-500">
                Reset the database to its initial state. All data will be permanently deleted.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowResetDialog(true)}
              >
                Reset Database
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-600">
                This action is irreversible. Type <strong>RESET</strong> to confirm.
              </p>
              <input
                type="text"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder='Type "RESET" to confirm'
                className="w-full rounded-md border border-red-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowResetDialog(false); setResetConfirm('') }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReset}
                  disabled={resetConfirm !== 'RESET' || resetDb.isPending}
                >
                  {resetDb.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Confirm Reset
                </Button>
              </div>
              {resetDb.isError && (
                <p className="text-xs text-red-600">{resetDb.error.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
