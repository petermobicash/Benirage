import React from 'react';

interface FormFieldProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'password' | 'color';
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  placeholder?: string;
  required?: boolean;
  options?: string[] | Array<{ value: string; label: string }>;
  rows?: number;
  className?: string;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  rows = 3,
  className = '',
  error,
  disabled = false,
  min,
  max
}) => {
  const baseInputClasses = `w-full px-4 py-3 sm:py-4 border rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent transition-colors min-h-[48px] touch-manipulation text-base ${
    error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
  } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  const renderInput = () => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (e && e.target) {
        onChange(e.target.value as string | number | boolean);
      }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e && e.target) {
        onChange(e.target.checked);
      }
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            disabled={disabled}
            className={`${baseInputClasses} resize-none`}
          />
        );

      case 'select':
        return (
          <select
            value={value as string}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
            {options.map((option) => {
              if (typeof option === 'string') {
                return (
                  <option key={option} value={option}>
                    {option}
                  </option>
                );
              } else {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              }
            })}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={handleCheckboxChange}
              required={required}
              disabled={disabled}
              className="rounded border-gray-300 text-golden focus:ring-golden"
            />
            <span className="text-sm text-dark-blue">{label}</span>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <label key={optionValue} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={label}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    className="border-gray-300 text-golden focus:ring-golden"
                  />
                  <span className="text-sm text-dark-blue">
                    {optionLabel}
                  </span>
                </label>
              );
            })}
          </div>
        );

      default:
        return (
          <input
            type={type}
            value={value as string}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className={className}>
      {type !== 'checkbox' && (
        <label className="block text-sm font-medium text-dark-blue mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;