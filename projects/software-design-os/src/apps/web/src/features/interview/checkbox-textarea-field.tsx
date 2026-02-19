import { CheckboxField } from './checkbox-field'

interface CheckboxTextareaFieldProps {
  options: string[]
  selected: string[]
  text: string
  onSelectedChange: (selected: string[]) => void
  onTextChange: (text: string) => void
  textareaLabel?: string
  placeholder?: string
}

export function CheckboxTextareaField({
  options,
  selected,
  text,
  onSelectedChange,
  onTextChange,
  textareaLabel,
  placeholder,
}: CheckboxTextareaFieldProps) {
  return (
    <div className="space-y-4">
      <CheckboxField options={options} selected={selected} onChange={onSelectedChange} />
      {textareaLabel && (
        <label className="block text-sm font-medium text-zinc-600">{textareaLabel}</label>
      )}
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
      />
    </div>
  )
}
