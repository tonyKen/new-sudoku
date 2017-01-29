import * as _ from 'lodash';
import {
    SUDOKU_NUMBERS,
    SQUARE_TABLE,
    squareIndex,
    SimpleSudoku
} from './utility';

function duplicates (array: Array<number>) : number {
    const filtered = array.filter(c => c !== undefined);
    const grouped = _.groupBy(filtered, c => c);
    const picked = _.pickBy(
        grouped,
        x => x.length > 1
    );
    return _.values(picked).length;
}

function isFilled (grid: SimpleSudoku) : boolean {
    return grid.every(row => row.every(n => n !== undefined))
}

function isCorrect (rows: SimpleSudoku, columns: SimpleSudoku, squares: SimpleSudoku) : boolean {
    const duplicatesInRow = rows.some(row => {
        return duplicates(row) !== 0;
    });
    if (duplicatesInRow) {
        return false;
    }
    const duplicatesInColumns = columns.some(column => {
        return duplicates(column) !== 0;
    });
    if (duplicatesInColumns) {
        return false;
    }
    const duplicatesInSquares = squares.some(square => {
        return duplicates(square) !== 0;
    });
    if (duplicatesInSquares) {
        return false;
    }
    return true;
}

function getColumns (grid: SimpleSudoku): SimpleSudoku {
    const columns: SimpleSudoku = [];
    // calculate the duplicates for every column
    for (let x = 0; x < 9; x++) {
        const column: Array<number> = [];
        for (let y = 0; y < 9; y++) {
            const cell = grid[y][x];
            column.push(cell);
        }
        columns[x] = column;
    }
    return columns;
}

function getSquares (grid: SimpleSudoku): SimpleSudoku {
    const squares: SimpleSudoku = [];
     // calculate the duplicates in every square
    for (let s = 0; s < 9; s++) {
        const square = SQUARE_TABLE[s];
        const squareValues: Array<number> = [];
        for (let xy = 0; xy < 9; xy++) {
            const [x, y] = square[xy];
            squareValues.push(grid[y][x]);
        }
        squares[s] = squareValues;
    }
    return squares;
}

function getMinimumRemainingValue (
    grid: SimpleSudoku, rows: SimpleSudoku, columns: SimpleSudoku, squares: SimpleSudoku)
{
    const numberOfRemainingValuesForEveryCell: Array<{x: number, y: number, remainingValues: Array<number>}> = [];

    // find minimum remaining value
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (grid[y][x] === undefined) {
                const row = rows[y];
                const column = columns[x];
                const square = squares[squareIndex(x, y)];
                const numbers = row.concat(column).concat(square);
                const remainingValues = SUDOKU_NUMBERS.filter(i => {
                    return numbers.indexOf(i) === -1;
                });
                numberOfRemainingValuesForEveryCell.push({
                    x,
                    y,
                    remainingValues
                });
            }
        }
    }

    const sortedRemainingValues = _.sortBy(numberOfRemainingValuesForEveryCell, c => c.remainingValues.length);
    return sortedRemainingValues[0];
}

function createNewGrids (grid: SimpleSudoku, x: number, y: number, values) {
     const newGrids = values.map(number => {
        return grid.map((row, i) => {
            // save some memory
            if (y === i) {
                const newRow = [].concat(row);
                newRow[x] = number;
                return newRow;
            }
            return row;
        });
    });
    return newGrids;
}

export function _solveGrid (stack: Array<SimpleSudoku> = [], counter: number) : SimpleSudoku {
    if (stack.length === 0) {
        return null;
    }
    const [grid, ...rest] = stack;
    counter++;

    const rows    = grid;
    const columns = getColumns(grid);
    const squares = getSquares(grid);

    const completelyFilled = isFilled(grid);
    if (completelyFilled && isCorrect(rows, columns, squares)) {
        console.log('counter: ' + counter);
        return grid;
    } else {
        _solveGrid(rest, counter);
    }

    const {remainingValues, x, y} = getMinimumRemainingValue(grid, rows, columns, squares);
    const newGrids = createNewGrids(grid, x, y, remainingValues);

    return _solveGrid(newGrids.concat(rest), counter);
}

export function solve (grid: SimpleSudoku) {
    return _solveGrid([grid], 0);
}
