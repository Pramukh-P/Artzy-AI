import React, { useRef, useState } from 'react';

const OTPInput = ({ length = 6, value, onChange }) => {
  const inputsRef = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[i] = val;
    onChange(newDigits.join(''));
    if (val && i < length - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted.padEnd(length, '').slice(0, length));
      inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
            bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
            ${d ? 'border-[#6469ff] shadow-md shadow-[#6469ff]/20' : 'border-gray-300 dark:border-gray-600'}
            focus:border-[#6469ff] focus:shadow-md focus:shadow-[#6469ff]/20`}
        />
      ))}
    </div>
  );
};

export default OTPInput;
