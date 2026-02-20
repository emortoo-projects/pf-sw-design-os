const INPUT_CLASS =
  'mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'

interface CreateAdminStepProps {
  name: string
  email: string
  password: string
  confirmPassword: string
  onNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onConfirmPasswordChange: (v: string) => void
}

export function CreateAdminStep({
  name,
  email,
  password,
  confirmPassword,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
}: CreateAdminStepProps) {
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword
  const passwordTooShort = password.length > 0 && password.length < 8

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">
        Create your admin account. This will be the first user in the system.
      </p>

      <div>
        <label htmlFor="setup-name" className="text-sm font-medium text-zinc-700">
          Name
        </label>
        <input
          id="setup-name"
          type="text"
          required
          autoFocus
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Your name"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="setup-email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="setup-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="admin@example.com"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="setup-password" className="text-sm font-medium text-zinc-700">
          Password
        </label>
        <input
          id="setup-password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Minimum 8 characters"
          className={INPUT_CLASS}
        />
        {passwordTooShort && (
          <p className="mt-1 text-xs text-amber-600">Password must be at least 8 characters</p>
        )}
      </div>

      <div>
        <label htmlFor="setup-confirm" className="text-sm font-medium text-zinc-700">
          Confirm Password
        </label>
        <input
          id="setup-confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          placeholder="Confirm your password"
          className={INPUT_CLASS}
        />
        {passwordMismatch && (
          <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
        )}
      </div>
    </div>
  )
}
