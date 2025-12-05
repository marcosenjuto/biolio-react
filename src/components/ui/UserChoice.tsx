import React, { useState } from 'react'

export interface UserChoiceOption {
  label: string
  value: string | null
  action: 'requery' | 'cancel'
}

export interface UserChoiceProps {
  question: string
  options: UserChoiceOption[]
  original_query: string
  onSelect?: (choice: string, originalQuery: string) => void
}

export function UserChoice({ question, options, original_query, onSelect }: UserChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (option: UserChoiceOption) => {
    if (option.action === 'cancel') {
        // Handle cancel if needed, maybe just disable
        setSelected('__cancel__')
        return
    }
    
    if (option.value) {
      setSelected(option.value)
      onSelect?.(option.value, original_query)
    }
  }

  return (
    <div className="user-choice-container bg-white border border-gray-200 rounded-lg p-4 shadow-sm my-2 max-w-md">
      <p className="text-sm font-medium text-gray-900 mb-3">{question}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option)}
            disabled={!!selected}
            className={`px-4 py-2 text-sm rounded-md transition-all border text-left sm:text-center ${
              selected === option.value
                ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            } ${!!selected && selected !== option.value ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
