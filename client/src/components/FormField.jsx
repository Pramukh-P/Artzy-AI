import React from 'react';

const FormField = ({
  labelName, type = 'text', name, placeholder,
  value, handleChange, isSurpriseMe, handleSurpriseMe,
  required = false, autoComplete,
}) => (
  <div>
    <div className="flex items-center gap-2 mb-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {labelName}
      </label>
      {isSurpriseMe && (
        <button
          type="button"
          onClick={handleSurpriseMe}
          className="text-xs font-semibold bg-gradient-to-r from-[#6469ff]/10 to-[#8b5cf6]/10 dark:from-[#6469ff]/20 dark:to-[#8b5cf6]/20 text-[#6469ff] py-1 px-3 rounded-full hover:from-[#6469ff]/20 hover:to-[#8b5cf6]/20 transition-all"
        >
          🎲 Surprise Me
        </button>
      )}
    </div>
    <input
      type={type}
      id={name}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      required={required}
      autoComplete={autoComplete}
      className="input-base"
    />
  </div>
);

export default FormField;
