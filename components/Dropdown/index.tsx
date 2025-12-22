'use client';

import {
    Dropdown,
    DropdownItem,
    type DropdownTheme,
} from 'flowbite-react';

import {
    focusStyle,
} from '@/data/styles';

import {
    arrowDownIcon,
} from '@/data/icons';

import {
    styleTrim,
} from '@/logic/utilities';

import Tooltip from '@/components/Tooltip';



const theme: DropdownTheme = {
    "arrowIcon": "ml-2 h-4 w-4",
    "content": "bg-black focus:outline-none",
    "floating": {
        "animation": "transition-opacity",
        "arrow": {
            "base": "absolute z-10 h-2 w-2 rotate-45",
            "style": {
                "dark": "bg-stone-900 dark:bg-stone-700",
                "light": "bg-white",
                "auto": "bg-white dark:bg-stone-700"
            },
            "placement": "-4px"
        },
        "base": "z-10 w-fit border divide-y divide-stone-100 shadow focus:outline-none",
        "content": "py-1 text-sm text-stone-700 dark:text-stone-200",
        "divider": "my-1 h-px bg-stone-100 dark:bg-stone-600",
        "header": "block py-2 px-4 text-sm text-stone-700 dark:text-stone-200",
        "hidden": "invisible opacity-0",
        "item": {
            "container": "bg-stone-600",
            "base": "flex items-center justify-end py-2 px-4 text-sm text-white cursor-pointer w-full hover:bg-stone-700 hover:text-white focus:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-600 focus:outline-none dark:hover:text-white dark:focus:bg-stone-600 dark:focus:text-white",
            "icon": "mr-2 h-4 w-4"
        },
        "style": {
            "dark": "bg-stone-600 text-white dark:bg-stone-700",
            "light": "border border-stone-200 bg-white text-stone-900",
            "auto": "border border-stone-200 bg-white text-stone-900 dark:border-none dark:bg-stone-700 dark:text-white"
        },
        "target": "w-fit"
    },
    "inlineWrapper": "flex items-center"
};


export default function CustomDropdown({
    name,
    selected,
    selectables,
    tooltip,
    atSelect,
}: {
    name: string,
    selected: string,
    selectables: string[],
    tooltip?: React.ReactNode,
    atSelect: (selected: string) => void,
}) {
    return (
        <div
            className="flex items-center justify-between my-2"
        >
            <div
                className="flex items-center justify-between gap-2"
            >
                <div>
                    {name}
                </div>

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

            <Dropdown
                label=""
                renderTrigger={() => (
                    <button
                        className={styleTrim(`
                            ${focusStyle} p-1 flex gap-2 items-center
                        `)}
                    >
                        {selected}

                        <span>
                            {arrowDownIcon}
                        </span>
                    </button>
                )}
                dismissOnClick={true}
                inline={true}
                theme={theme}
                placement="bottom-end"
            >
                {selectables.map((selectable) => {
                    return (
                        <DropdownItem
                            key={selectable}
                            className={`
                                ${selectable === selected && 'bg-stone-700 text-white cursor-default'}
                            `}
                            onClick={() => {
                                atSelect(selectable);
                            }}
                        >
                            {selectable}
                        </DropdownItem>
                    );
                })}
            </Dropdown>
        </div>
    );
}
