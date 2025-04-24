import React from 'react';

export interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;

    /** optional extra Tailwind / CSS classes */
    className?: string;

    /** quick size helper: xs | sm | md | lg  */
    size?: 'xs' | 'sm' | 'md' | 'lg';

    /** inline-style fallback (unchanged) */
    style?: React.CSSProperties;
}

const sizeMap: Record<NonNullable<ButtonProps['size']>, string> = {
    xs: 'py-1 px-2 text-xs w-20',
    sm: 'py-1.5 px-3 text-sm w-28',
    md: 'py-2 px-4 text-base w-40',   // previous default
    lg: 'py-3 px-5 text-lg w-56',
};

const DarkButton: React.FC<ButtonProps> = ({
    label,
    onClick,
    disabled,
    className = '',
    size = 'md',
    style,
}) => {
    return (
        <button
            disabled={disabled}
            style={style}
            onClick={onClick}
            className={`
        bg-lime-50 hover:bg-lime-200 disabled:bg-white disabled:opacity-70
        focus:outline-none focus:ring-2 focus:ring-lime-800
        text-black transition-colors duration-300 select-none
        rounded-none mt-2
        ${sizeMap[size]}
        ${className}
      `}
        >
            {label}
        </button>
    );
};

export default DarkButton;
