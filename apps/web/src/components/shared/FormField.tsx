import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface FormFieldProps {
    label: string;
    name: string;
    register: UseFormRegister<any>;
    errors: FieldErrors;
    options?: { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
    type?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = 'text',
    register,
    errors,
    options,
    placeholder,
    required,
}) => {
    const error = errors[name];

    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {type === 'select' ? (
                <select
                    id={name}
                    {...register(name)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Selecione...</option>
                    {options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    id={name}
                    {...register(name)}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            ) : (
                <input
                    id={name}
                    type={type}
                    {...register(name)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error.message as string}</p>
            )}
        </div>
    );
};
