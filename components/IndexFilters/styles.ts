// shared Tailwind class strings for the filter atoms. lifting them so the
// atoms agree on the "selected vs unselected" appearance without each
// re-declaring the same strings.

export const selectedStyle =
    'border-lime-500 text-lime-400 bg-lime-500/10 cursor-pointer';

export const unselectedStyle =
    'border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300 cursor-pointer';

export const disabledStyle =
    'border-gray-800 text-gray-700 cursor-not-allowed';

// shared focus ring (Tab keyboard nav). replaces the bare focus:outline-none
// the previous implementation had on every button.
export const focusRing =
    'focus:outline-none focus-visible:outline-1 focus-visible:outline-lime-500 focus-visible:outline-offset-1';
