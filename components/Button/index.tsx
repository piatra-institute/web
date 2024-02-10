export interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

const DarkButton: React.FC<ButtonProps> = ({
    label,
    onClick,
    ...rest
}) => {
    return (
        <button
            className={`
                bg-lime-50 hover:bg-lime-200 disabled:bg-white disabled:opacity-70
                focus:outline-none focus:ring-2 focus:ring-lime-800
                text-black
                py-2 px-4 w-40 mt-10 rounded-none transition-colors duration-300 select-none
            `}
            onClick={onClick}
            {...rest}
        >
            {label}
        </button>
    );
};


export default DarkButton;
