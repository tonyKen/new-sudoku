import {Cell} from 'src/ducks/sudoku/model';

import * as _ from 'lodash';
import { SUDOKU_NUMBERS } from 'src/engine/utility';

export interface CellIndexed extends Cell {
  index: number;
}

export interface PositionedCell {
  cell: Cell;
  x: number;
  y: number;
}

export interface NoteCell {
  x: number;
  y: number;
  note: number;
}

export interface ConflictingCell {
  cell: CellIndexed,
  conflicting: CellIndexed[];
  possibilities: number[];
}

export interface ConflictingPath {
  from: PositionedCell;
  to: PositionedCell;
  index: number;
}

const notePadding = 4;
const notePaddingSmall = 2;

export default class SudokuState {

  width: number;
  height: number;

  get xSection() {
    const xSection = this.height / 9;
    return xSection;
  }

  get ySection() {
    const ySection = this.width / 9;
    return ySection;
  }

  getNextInterSection(x, y) {
    const nextIntersectionX = this.xSection * Math.floor(x / this.xSection);
    const nextIntersectionY = this.ySection * Math.floor(y / this.ySection);
    return {x: nextIntersectionX, y: nextIntersectionY};
  }

  getFromTo(from, to) {
    const startToFrame = this.getNextInterSection(from.x, from.y);
    const frameToEnd = this.getNextInterSection(to.x, to.y);
    return {
      from: {
        x: startToFrame.x + (from.x < to.x ? this.xSection : 0),
        y: startToFrame.y + (from.y < to.y ? this.ySection : 0),
      },
      to: {
        x: frameToEnd.x + (from.x > to.x ? this.xSection : 0),
        y: frameToEnd.y + (from.y > to.y ? this.ySection : 0),
      },
    };
  }

  uniquePaths(paths: ConflictingPath[]) {
    return _.uniqBy(paths, p => {
      const fromCell = p.from;
      const toCell = p.to;
      return [`${fromCell.cell.x}-${fromCell.cell.y}`, `${toCell.cell.x}-${toCell.cell.y}`].sort().join('-');
    });
  }

  getNotePosition(n: number) {
    const positions = [
      {x: 0, y: 0},
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 2, y: 0},
      {x: 0, y: 1},
      {x: 1, y: 1},
      {x: 2, y: 1},
      {x: 0, y: 2},
      {x: 1, y: 2},
      {x: 2, y: 2},
    ];
    // TODO
    const padding = window.innerWidth < 450 ? notePaddingSmall : notePadding;
    const noteWidth = this.xSection - padding * 2;
    const noteHeight = this.ySection - padding * 2;

    const {x, y} = positions[n];

    return {
      x: (noteWidth / 3) * (x + 0.5) + padding,
      y: (noteHeight / 3) * (y + 0.5) + padding,
      note: n,
    };

  }

  positionedCells(sudoku: Cell[]): PositionedCell[] {

    const fontXOffset = this.xSection / 2;
    const fontYOffset = this.ySection / 2;

    return sudoku.map(c => {
      const positionedCell: PositionedCell = {
        x: this.xSection * c.x + fontXOffset,
        y: this.ySection * c.y + fontYOffset,
        cell: c,
      };

      return positionedCell;
    });
  }

  conflictingFields(sudoku: Cell[]): ConflictingCell[] {
    const sudokuWithIndex: CellIndexed[] = sudoku.map((c, i) => ({...c, index: i}));

    return sudokuWithIndex.map((cell) => {
      const rowCells = sudokuWithIndex.filter(c => c.x === cell.x);
      const columnCells = sudokuWithIndex.filter(c => c.y === cell.y);
      const squares = Object.values(
        _.groupBy(sudokuWithIndex, (c) => {
          return `${Math.floor(c.x / 3)}-${Math.floor(c.y / 3)}`;
        }),
      );
      const squareCells = squares.filter(square => {
        return square.indexOf(cell) !== -1;
      })[0];

      const all = rowCells
        .concat(columnCells)
        .concat(squareCells)
        .filter(c => c.index !== cell.index)
        .filter(c => c.number !== undefined);

      const otherNumbers = _.uniq(all.map(c => c.number));
      const possibilities = SUDOKU_NUMBERS.filter(
        n => !otherNumbers.includes(n)
      );

      return {
        cell,
        conflicting: all,
        possibilities,
      }
    });
  }

  getPathsFromConflicting(
    conflictingCell: ConflictingCell,
    positionedCells: PositionedCell[],
    ): ConflictingPath[] {
      const {conflicting, cell} = conflictingCell;
      const paths = [];
      conflicting.forEach(c => {
        const targetPosition = positionedCells[c.index];
        const fromPosition = positionedCells[cell.index];
        if (c.number === cell.number && c.index !== cell.index) {
          const path: ConflictingPath = {
            from: fromPosition,
            to: targetPosition,
            index: c.index
          };
          paths.push(path);
        }
      });

      return paths;
  }
}
