import React, { useRef, useEffect } from 'react';

/**
 * Toggle component for binary choices with consistent styling
 * Based on the radio button styling from RiskInputForm
 * 
 * Keyboard Navigation:
 * - Tab: Move focus to the radio group
 * - Space/Enter: Select focused option
 * - Arrow Left/Up: Select previous option
 * - Arrow Right/Down: Select next option
 */
const Toggle = ({ 
    id,
    checked,
    onChange,
    labels = { checked: 'Yes', unchecked: 'No' },
    name,
    className = '',
    disabled = false,
    helpText,
    isMobile = false,
    required = false,
    ariaLabel,
    error,
    errorMessage
}) => {
    const mobileSuffix = isMobile ? '-mobile' : '';
    const checkedRef = useRef(null);
    const uncheckedRef = useRef(null);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (disabled) return;

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                onChange(false);
                uncheckedRef.current?.focus();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                onChange(true);
                checkedRef.current?.focus();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                if (document.activeElement === checkedRef.current) {
                    onChange(true);
                } else if (document.activeElement === uncheckedRef.current) {
                    onChange(false);
                }
                break;
            default:
                break;
        }
    };

    // Focus management
    useEffect(() => {
        if (checked) {
            checkedRef.current?.focus();
        } else {
            uncheckedRef.current?.focus();
        }
    }, [checked]);

    const getInputClassName = () => {
        return `h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'bg-red-50 border-red-300' : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    };
    
    return (
        <div className={`space-y-2 ${className}`}>
            <div 
                role="radiogroup" 
                aria-required={required} 
                aria-label={ariaLabel}
                aria-invalid={error ? 'true' : 'false'}
                className={`flex items-center space-x-4 ${error ? 'bg-red-50 p-2 rounded-md' : ''}`}
                onKeyDown={handleKeyDown}
            >
                {/* Checked Option */}
                <div className="flex items-center space-x-2">
                    <input
                        ref={checkedRef}
                        type="radio"
                        id={`${id}-checked${mobileSuffix}`}
                        name={`${name}${mobileSuffix}`}
                        checked={checked}
                        onChange={() => onChange(true)}
                        className={getInputClassName()}
                        disabled={disabled}
                        aria-describedby={`${helpText ? `${id}-help` : ''} ${error ? `${id}-error` : ''}`}
                        required={required}
                        tabIndex={checked ? 0 : -1}
                    />
                    <label 
                        htmlFor={`${id}-checked${mobileSuffix}`}
                        className={`text-sm ${
                            disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                        } select-none`}
                    >
                        {labels.checked}
                    </label>
                </div>

                {/* Unchecked Option */}
                <div className="flex items-center space-x-2">
                    <input
                        ref={uncheckedRef}
                        type="radio"
                        id={`${id}-unchecked${mobileSuffix}`}
                        name={`${name}${mobileSuffix}`}
                        checked={!checked}
                        onChange={() => onChange(false)}
                        className={getInputClassName()}
                        disabled={disabled}
                        aria-describedby={`${helpText ? `${id}-help` : ''} ${error ? `${id}-error` : ''}`}
                        required={required}
                        tabIndex={!checked ? 0 : -1}
                    />
                    <label 
                        htmlFor={`${id}-unchecked${mobileSuffix}`}
                        className={`text-sm ${
                            disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                        } select-none`}
                    >
                        {labels.unchecked}
                    </label>
                </div>
            </div>

            {/* Help Text */}
            {helpText && (
                <p 
                    id={`${id}-help`}
                    className="text-sm text-gray-500 mt-1"
                >
                    {helpText}
                </p>
            )}

            {/* Error Message */}
            {error && errorMessage && (
                <p 
                    id={`${id}-error`}
                    className="text-sm text-red-600 mt-1"
                    role="alert"
                >
                    {errorMessage}
                </p>
            )}
        </div>
    );
};

export default Toggle;
