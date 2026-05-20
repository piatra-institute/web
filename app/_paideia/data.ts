export type Course = {
    name: string;
    slug: string;
    description: string;
    audience: string;
    link: string;
};

export const courses: Course[] = [
    {
        name: 'unelte noi (new tools)',
        slug: 'unelte-noi',
        description: 'A Romanian-first YouTube course taking absolute beginners from basic computer gestures to proficient AI-assisted terminal and project work. 60 modules, organized into 6 tracks, taught one concept at a time, each video around 10 minutes.',
        audience: 'Children around 10, adults around 50 and over.',
        link: '/paideia/unelte-noi',
    },
];
