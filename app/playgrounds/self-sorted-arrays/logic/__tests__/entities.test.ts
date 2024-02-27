import { expect, test } from 'vitest';

import {
    CellData,
    CellOptions,
} from '../../data';

import {
    Tissue,
    Cell,
} from '../entities';



const defaultCellOptions: CellOptions = {
    minimumValue: 0,
    maximumValue: 100,

    mutationableMinimum: 0,
    mutationableMaximum: 10,
    mutationableStrategy: 'random',

    damageableMinimum: 0,
    damageableMaximum: 10,
    damageablePassiveThreshold: 7,
    damageableFrozenThreshold: 3,

    convertibleMinimum: 0,
    convertibleMaximum: 10,

    divisibleMinimum: 0,
    divisibleMaximum: 10,

    apoptosableMinimum: 0,
    apoptosableMaximum: 10,

    speedMinimum: 0,
    speedMaximum: 1000,

    responsivenessMinimum: 0,
    responsivenessMaximum: 1000,
};


test('Tissue sorts bubble', () => {
    const tissue = new Tissue();

    const cells: CellData[] = [
        {
            id: 'cell5',
            value: 5,
            color: 'red',
            algotype: 'bubble',
        },
        {
            id: 'cell4',
            value: 4,
            color: 'blue',
            algotype: 'bubble',
        },
        {
            id: 'cell3',
            value: 3,
            color: 'green',
            algotype: 'bubble',
        },
    ];

    for (const cell of cells) {
        tissue.addCell(new Cell(
            {
                ...cell,
            },
            {
                ...defaultCellOptions,
            },
        ));
    }

    tissue.step();
    tissue.step();

    expect(tissue.atEquilibrium).toBe(true);
});



test('Tissue sorts bubble mutationable', () => {
    const tissue = new Tissue();

    const cells: CellData[] = [
        {
            id: 'cell5',
            value: 5,
            color: 'red',
            algotype: 'bubble',
        },
        {
            id: 'cell4',
            value: 4,
            color: 'blue',
            algotype: 'bubble',
        },
        {
            id: 'cell3',
            value: 3,
            color: 'green',
            algotype: 'bubble',
        },
        {
            id: 'cell1',
            value: 1,
            color: 'green',
            algotype: 'bubble',
        },
        {
            id: 'cell1b',
            value: 1,
            color: 'green',
            algotype: 'bubble',
        },
        {
            id: 'cell1c',
            value: 1,
            color: 'green',
            algotype: 'bubble',
        },
        {
            id: 'cell5',
            value: 5,
            color: 'green',
            algotype: 'bubble',
        },
    ];

    for (const cell of cells) {
        tissue.addCell(new Cell(
            {
                ...cell,
                swap: 'proactive',
                damageable: 3,
            },
            {
                ...defaultCellOptions,
                damageablePassiveThreshold: 2,
                damageableFrozenThreshold: 3,
            },
        ));
    }

    tissue.step();
    // console.log(tissue.cells);
    tissue.step();
    // console.log(tissue.cells);
    tissue.step();
    // console.log(tissue.cells);
    tissue.step();
    // console.log(tissue.cells);
    tissue.step();
    // console.log(tissue.cells);
    tissue.step();
    // console.log(tissue.cells);
    tissue.step();
    // console.log(tissue.cells);

    // expect(tissue.atEquilibrium).toBe(true);
});
