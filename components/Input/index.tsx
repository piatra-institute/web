import {
    useState,
} from 'react';



export interface InputProps {
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    type?: 'text' | 'number';
    min?: number;
    max?: number;
}

const DarkInput: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChange,
    ...rest
}) => {
    const [focused, setFocused] = useState<boolean>(false);

    const handleInputChange = (e: any) => {
        onChange(e.target.value);
    };

    return (
        <div
            className="m-10 select-none"
        >
            {label && (
                <label className="block text-gray-300 text-sm font-medium mb-1">{label}</label>
            )}

            <input
                className={`
                    bg-lime-50 text-black placeholder-lime-500
                    focus:outline-none focus:ring-2 focus:ring-lime-800
                    border border-lime-800 rounded-none
                    px-4 py-2 w-80 text-center
                `}
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                {...rest}
            />
        </div>
    );
};

export default DarkInput;
