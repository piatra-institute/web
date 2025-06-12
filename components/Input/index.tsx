import { styleTrim } from '@/logic/utilities';



export interface InputProps {
    value: string | number;
    onChange: (value: string) => void;

    /* optional visuals */
    placeholder?: string;
    label?: string;
    compact?: boolean;
    centered?: boolean;

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
    centered,
    type = 'text',
    ...rest
}) => {
    /* range gets its own width & removes text-specific classes */
    const isRange = type === 'range';

    return (
        <div
            className={
                compact
                    ? 'flex gap-2 justify-between items-center mb-4'
                    : 'm-10 select-none'
            }
        >
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
              ${compact ? 'w-24' : 'w-60 md:w-72'}
              ${centered ? 'text-center' : 'text-right'}
            `}
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
