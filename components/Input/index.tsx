export interface InputProps {
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    compact?: boolean;
    centered?: boolean;
    type?: 'text' | 'number';
    min?: number;
    max?: number;
}


const Input: React.FC<InputProps> = ({
    value,
    onChange,
    placeholder,
    label,
    compact,
    centered,
    ...rest
}) => {
    return (
        <div
            className={compact ? 'flex gap-2 justify-between items-center mb-4' : 'm-10 select-none'}
        >
            {label && (
                <label className="block mb-1">{label}</label>
            )}

            <input
                className={`
                    bg-lime-50 text-black placeholder-lime-500
                    focus:outline-none focus:ring-2 focus:ring-lime-800
                    border border-lime-800 rounded-none
                    px-4 py-2
                    ${compact ? 'w-24' : 'w-60 md:w-72'}
                    ${centered ? 'text-center' : 'text-right'}
                `}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                name={label || 'input'}
                {...rest}
            />
        </div>
    );
};


export default Input;
