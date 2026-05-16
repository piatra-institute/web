import { CASES, type CaseKey } from './logic/cases';
import type { AxisValues } from './logic/model';


export interface CalibrationCase {
    key: CaseKey;
    name: string;
    description: string;
    params: AxisValues;
    expectedWelfare: number;
    source: string;
}

function build(key: CaseKey, source: string): CalibrationCase {
    const c = CASES[key];
    return {
        key,
        name: c.label,
        description: c.subtitle,
        params: c.canonical,
        expectedWelfare: c.expectedObstruction,
        source,
    };
}

export const calibrationCases: CalibrationCase[] = [
    build('odysseus', 'Homeric reading (Auerbach 1946, ch. 1)'),
    build('orpheus', 'Ovid Metamorphoses X; Blanchot 1955 (Le regard d\'Orphée)'),
    build('gilgamesh', 'Standard Babylonian text; Damrosch 2006 (The Buried Book)'),
    build('aeneas', 'Virgil Aeneid; Adam Parry 1963 (The Two Voices of Virgil)'),
    build('dante', 'Singleton 1954 (Dante Studies); Auerbach 1953 (Figura)'),
    build('faust', 'Goethe Faust I-II; Berman 1982 (All That Is Solid Melts into Air)'),
    build('kafka', 'The Castle, The Trial; Adorno 1953 (Notes on Kafka)'),
    build('balzac', 'La Comédie humaine; Lukács 1937 (Studies in European Realism)'),
    build('musil', 'Der Mann ohne Eigenschaften; Pike 1961; Luft 1980'),
    build('sabato', 'El túnel 1948; Sobre héroes y tumbas 1961'),
];
