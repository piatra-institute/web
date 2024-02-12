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
