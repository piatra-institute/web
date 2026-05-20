export type Track = {
    slug: 'core' | 'daily-life' | 'ai' | 'maker' | 'civic' | 'parent';
    name: string;
    body: string;
};

export type MasteryLayer = {
    layer: 'Recunoaște' | 'Înțelege' | 'Folosește';
    body: string;
};

export const course = {
    title: 'Unelte Noi',
    tagline: 'Calculatorul, Internetul și AI-ul explicate fără grabă.',
    promise: 'Întrebi. Verifici. Salvezi. Rămâi în control.',
    intro: 'Un curs video în limba română, pentru oricine simte că tehnologia merge prea repede. Fără grabă și fără jargon. Fiecare video explică un singur lucru și se încheie cu un exercițiu scurt, pe care îl poți face imediat.',
    audience: {
        copii: {
            label: 'Copii, în jur de 10 ani',
            body: 'Curiozitate, siguranță și curajul de a crea. Folosim exemple din viața lor: școală, povești, jocuri, prezentări, pasiuni, natură și istorie locală.',
        },
        adulti: {
            label: 'Adulți, de la 50 de ani în sus',
            body: 'Încredere, pași mici și control asupra propriilor unelte. Folosim exemple din viața de zi cu zi: email, formulare, programări, traduceri, acte de familie, călătorii și siguranță online.',
        },
    },
    mastery: [
        {
            layer: 'Recunoaște',
            body: 'Știi despre ce e vorba când vezi ceva pe ecran sau când un AI pomenește de el.',
        },
        {
            layer: 'Înțelege',
            body: 'Poți explica, cu vorbele tale, ce face și de ce contează.',
        },
        {
            layer: 'Folosește',
            body: 'Faci tu pașii, într-un folder de probă, fără teama că strici ceva.',
        },
    ] as MasteryLayer[],
    structure: {
        modules: 60,
        episodes: 778,
    },
    tracks: [
        {
            slug: 'core',
            name: 'Core',
            body: 'Postură, cum gândește calculatorul, sistem de operare, fișiere, browser, conturi, AI de bază, verificare, terminal de bază. Coloana vertebrală a cursului: aproape toată lumea trece pe aici.',
        },
        {
            slug: 'daily-life',
            name: 'Daily Life',
            body: 'Office, foi de calcul, poze și videoclipuri, imprimante și scanere, telefonul ca dispozitiv principal, cum cauți ajutor, control la distanță. Lucruri mărunte, dar care contează.',
        },
        {
            slug: 'ai',
            name: 'AI',
            body: 'Totul despre AI: prompt-uri, depanare cu AI, gestionarea contextului, AI multimodal, AI generativ, etică și AI integrat în aplicații.',
        },
        {
            slug: 'maker',
            name: 'Maker',
            body: 'Construiești lucruri: Git, GitHub, terminal, agenți AI, MCP, localhost, rețele, API-uri, deploy, Python, programare, baze de date, LaTeX/Lean, DevTools, automatizare.',
        },
        {
            slug: 'civic',
            name: 'Civic',
            body: 'Viața civică în România, GDPR, fraude, plăți digitale, cumpărături sigure, siguranța copiilor online, ce faci cu dispozitivele vechi și cum te ferești de riscuri.',
        },
        {
            slug: 'parent',
            name: 'Parent',
            body: 'Pentru părinți și profesori: cum te descurci cu AI-ul și cu viața online când ai un copil în grijă.',
        },
    ] as Track[],
} as const;
