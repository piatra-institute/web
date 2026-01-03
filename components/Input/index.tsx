import { styleTrim } from '@/logic/utilities';



export interface InputProps {
    value: string | number;
    onChange: (value: string) => void;

    /* optional visuals */
    placeholder?: string;
    label?: string;
    compact?: boolean;
    fullWidth?: boolean;
    centered?: boolean;
    className?: string;

    type?: 'text' | 'number' | 'range';

    /* numeric / range extras */
    min?: number;
    max?: number;
    step?: number;
    inputMode?: 'numeric' | 'decimal' | 'email';
    disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
    value,
    onChange,
    placeholder,
    label,
    compact,
    fullWidth,
    centered,
    className,
    type = 'text',
    ...rest
}) => {
    /* range gets its own width & removes text-specific classes */
    const isRange = type === 'range';

    const wrapperClass = compact
        ? 'flex gap-2 justify-between items-center mb-4'
        : fullWidth
        ? 'select-none'
        : 'm-10 select-none';

    return (
        <div className={wrapperClass}>
            {label && <label className="block mb-1">{label}</label>}

            <input
                type={type}
                className={styleTrim(`
          ${isRange
                        ? 'w-full h-2 bg-neutral-700 appearance-none cursor-pointer rounded'
                        : `
              bg-lime-50 text-black placeholder-lime-500
              border border-lime-800 rounded-none
              focus:outline-none focus:ring-2 focus:ring-lime-800
              px-4 py-2
              ${compact ? 'w-24' : fullWidth ? 'w-full' : 'w-60 md:w-72'}
              ${centered ? 'text-center' : 'text-right'}
            `}
          ${className || ''}
        `)}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                onFocus={(e) => {
                    if (!isRange) e.target.select();
                }}
                {...rest}
            />
        </div>
    );
};

export default Input;
