import dynamic from 'next/dynamic';



// Disable SSR for the playground canvas
const HalleyWindowPlayground = dynamic(
    () => import('./playground'),
    { ssr: false }
);


export default function Page() {
    return (
        <HalleyWindowPlayground />
    );
}