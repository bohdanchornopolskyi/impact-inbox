"use client"

interface VisibilityToggleProps {
  visible: boolean
  onToggle: () => void
}

export function VisibilityToggle({ visible, onToggle }: VisibilityToggleProps) {
  return (
    <button
      className="opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      <div className={`w-3 h-3 rounded-sm border ${visible ? "bg-blue-500 border-blue-500" : "border-gray-400"}`} />
    </button>
  )
}
