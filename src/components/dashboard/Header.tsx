interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="py-6 border-b border-slate-200 mb-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {description && (
        <p className="text-slate-500 mt-1">{description}</p>
      )}
    </div>
  )
}
