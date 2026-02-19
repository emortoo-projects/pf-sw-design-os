interface ProductOverviewCardProps {
  name: string
  tagline: string
  description: string
  onNameChange: (name: string) => void
  onTaglineChange: (tagline: string) => void
  onDescriptionChange: (description: string) => void
}

export function ProductOverviewCard({
  name,
  tagline,
  description,
  onNameChange,
  onTaglineChange,
  onDescriptionChange,
}: ProductOverviewCardProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-700">Product Overview</h3>
      <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Product Name"
          className="w-full border-0 bg-transparent text-xl font-bold text-zinc-900 placeholder:text-zinc-300 focus:outline-none"
        />
        <input
          type="text"
          value={tagline}
          onChange={(e) => onTaglineChange(e.target.value)}
          placeholder="One-line tagline"
          className="w-full border-0 bg-transparent text-sm font-medium text-primary-600 placeholder:text-zinc-300 focus:outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Detailed product description..."
          rows={4}
          className="w-full resize-y border-0 bg-transparent text-sm text-zinc-600 placeholder:text-zinc-300 focus:outline-none"
        />
      </div>
    </div>
  )
}
