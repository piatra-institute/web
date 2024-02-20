import {
    DetailedHTMLProps,
    ButtonHTMLAttributes,
} from 'react';

import Image from 'next/image';

import {
    focusStyle,
} from '@/data/styles';

import {
    styleTrim,
} from '@/logic/utilities';



export type LinkButtonProps = {
    text: string | JSX.Element;
    centered?: boolean;
    icon?: string | JSX.Element;
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;


export default function LinkButton({
    text,
    centered,
    icon,
    ...rest
}: LinkButtonProps) {
    const button = (
        <button
            className={styleTrim(`
                flex items-center gap-2
                p-1 m-auto
                cursor-pointer select-none font-bold
                ${focusStyle}
            `)}
            {...rest}
        >
            {typeof icon === 'string' ? (
                <Image
                    src={icon}
                    width={20}
                    height={20}
                    alt={typeof text === 'string' ? text : ''}
                />
            ) : (
                <>{icon}</>
            )}

            {icon ? (
                <div>
                    {text}
                </div>
            ) : (
                <>{text}</>
            )}
        </button>
    );

    if (centered) {
        return (
            <div
                className="flex items-center justify-center gap-2"
            >
                {button}
            </div>
        );
    }

    return (
        <>{button}</>
    );
}
