import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import UnelteNoiPage from './components/UnelteNoiPage';



export const metadata: Metadata = {
    title: 'unelte noi',
    description: 'Calculatorul, Internetul și AI-ul explicate fără grabă. Un curs Piatra Paideia.',

    openGraph: {
        ...defaultOpenGraph,
        title: 'unelte noi · paideia · piatra.institute',
        description: 'Calculatorul, Internetul și AI-ul explicate fără grabă.',
    },
};


export default function UnelteNoi() {
    return <UnelteNoiPage />;
}
