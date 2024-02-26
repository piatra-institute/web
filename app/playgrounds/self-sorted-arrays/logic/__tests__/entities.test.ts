import { expect, test } from 'vitest';

import {
    Tissue,
    Cell,
} from '../entities';



type CellsType = [
    Cell['id'], Cell['value'], Cell['color'], Cell['algotype']
][];


test('Tissue sorts bubble', () => {
    const tissue = new Tissue();

    const cells = [
        [
            'cell5',
            5,
            'red',
            'bubble',
        ],
        [
            'cell4',
            4,
            'blue',
            'bubble',
        ],
        [
            'cell3',
            3,
            'green',
            'bubble',
        ],
    ] as CellsType;

    for (const cell of cells) {
        tissue.addCell(new Cell(
            ...cell,
        ));
    }

    tissue.step();
    tissue.step();

    expect(tissue.atEquilibrium).toBe(true);
});



test('Tissue sorts bubble mutationable', () => {
    const tissue = new Tissue();

    const cells = [
        [
            'cell6',
            6,
            'red',
            'bubble',
        ],
        [
            'cell4',
            4,
            'blue',
            'bubble',
        ],
        [
            'cell3',
            3,
            'green',
            'bubble',
        ],
        [
            'cell1',
            1,
            'green',
            'bubble',
        ],
        [
            'cell1b',
            1,
            'green',
            'bubble',
        ],
        [
            'cell1c',
            1,
            'green',
            'bubble',
        ],
        [
            'cell5',
            5,
            'green',
            'bubble',
        ],
    ] as CellsType;

    for (const cell of cells) {
        tissue.addCell(new Cell(
            ...cell,
            'proactive',
            undefined,
            3,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            {
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
