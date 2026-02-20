import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCompleteSetup, type SetupInput } from '@/hooks/use-setup'
import { CreateAdminStep } from './create-admin-step'
import { AIProviderStep } from './ai-provider-step'
import { TemplateStep } from './template-step'

const TOTAL_STEPS = 3
const STEP_LABELS = ['Create Admin', 'AI Provider', 'Template']

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const completeSetup = useCompleteSetup()

  // Step 1: Admin data
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('')

  // Step 2: Provider data
  const [providerType, setProviderType] = useState<SetupInput['provider']>(undefined)

  // Step 3: Template data
  const [templateId, setTemplateId] = useState<string | undefined>(undefined)

  const canNext = () => {
    if (currentStep === 1) {
      return (
        adminName.trim().length > 0 &&
        adminEmail.trim().length > 0 &&
        adminPassword.length >= 8 &&
        adminPassword === adminConfirmPassword
      )
    }
    return true // Steps 2 and 3 are optional
  }

  const handleFinish = () => {
    const input: SetupInput = {
      admin: {
        email: adminEmail.trim(),
        name: adminName.trim(),
        password: adminPassword,
      },
    }
    if (providerType) {
      input.provider = providerType
    }
    completeSetup.mutate(input)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome to SDOS</CardTitle>
        <p className="text-sm text-zinc-500">
          Step {currentStep} of {TOTAL_STEPS}: {STEP_LABELS[currentStep - 1]}
        </p>
        {/* Progress bar */}
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < currentStep ? 'bg-primary-600' : 'bg-zinc-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {completeSetup.error && (
          <div className="mb-4 rounded-md bg-error-50 p-3 text-sm text-error-700">
            {completeSetup.error.message}
          </div>
        )}

        {currentStep === 1 && (
          <CreateAdminStep
            name={adminName}
            email={adminEmail}
            password={adminPassword}
            confirmPassword={adminConfirmPassword}
            onNameChange={setAdminName}
            onEmailChange={setAdminEmail}
            onPasswordChange={setAdminPassword}
            onConfirmPasswordChange={setAdminConfirmPassword}
          />
        )}

        {currentStep === 2 && (
          <AIProviderStep value={providerType} onChange={setProviderType} />
        )}

        {currentStep === 3 && (
          <TemplateStep value={templateId} onChange={setTemplateId} />
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        <div className="flex gap-2">
          {currentStep < TOTAL_STEPS ? (
            <>
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep((s) => s + 1)}
                >
                  Skip
                </Button>
              )}
              <Button onClick={() => setCurrentStep((s) => s + 1)} disabled={!canNext()}>
                Next
              </Button>
            </>
          ) : (
            <Button onClick={handleFinish} disabled={completeSetup.isPending}>
              {completeSetup.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Finish Setup
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
