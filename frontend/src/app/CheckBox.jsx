'use client'

import React from 'react'
import { Check } from 'lucide-react'



const Checkbox = ({ selected, handleChange }) => {
  const options = ['Beginner', 'Medium', 'Hard']

  return (
    <div className="flex justify-center items-center gap-8 md:gap-16 w-full max-w-[900px] py-4">
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="relative">
            <input
              type="checkbox"
              checked={selected === option}
              onChange={() => handleChange(option)}
              className="sr-only"
            />
            <div
              className={`w-6 h-6 md:w-8 md:h-8 border-2 rounded-md flex items-center justify-center transition-all duration-300
                ${selected === option 
                  ? 'bg-[#242F5C] border-[#242F5C]' 
                  : 'border-[#242F5C] bg-transparent group-hover:bg-[#F0F0F0]'
                }
              `}
            >
              {selected === option && (
                <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
              )}
            </div>
          </div>
          <span className="text-base md:text-2xl font-bold text-[#242F5C]">
            {option}
          </span>
        </label>
      ))}
    </div>
  )
}

export default Checkbox