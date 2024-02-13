import Tooltip from '@/components/Tooltip';



const Toggle = ({
    text,
    value,
    toggle,
    tooltip,
}: {
    text: string;
    value: boolean;
    toggle: () => void;
    tooltip?: React.ReactNode;
}) => {
    return (
        <div className="flex gap-6 justify-between my-2">
            <div
                className="flex items-center gap-2"
            >
                <>
                    {text}
                </>

                {tooltip && (
                    <Tooltip
                        content={(
                            <div
                                className="max-w-[250px] p-2"
                            >
                                {tooltip}
                            </div>
                        )}
                    >
                        <span
                            className="text-gray-400 cursor-pointer"
                        >
                            ?
                        </span>
                    </Tooltip>
                )}
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    name={text}
                    checked={value}
                    className="sr-only peer"
                    onChange={() => {
                        toggle();
                    }}
                />
                <div className={`
                    w-11 h-6 bg-gray-500
                    peer-focus:outline-none
                    peer-focus:ring-2
                    peer-focus:ring-white
                    dark:peer-focus:ring-white
                    peer
                    dark:bg-gray-500
                    peer-checked:after:translate-x-full
                    rtl:peer-checked:after:-translate-x-full
                    peer-checked:after:border-white
                    after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                    after:bg-white after:border-gray-300 after:border
                    after:h-5 after:w-5
                    after:transition-all
                    dark:border-gray-600
                    peer-checked:bg-gray-800
                `}/>
            </label>
        </div>
    );
}


export default Toggle;
