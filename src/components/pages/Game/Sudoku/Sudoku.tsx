import * as React from "react";
import {showMenu, selectCell, hideMenu, GameStateMachine} from "src/state/game";

import SudokuMenuCircle, {MenuWrapper, MenuContainer} from "./SudokuMenuCircle";
import {emptyGrid} from "src/state/sudoku";
import {
  GridLineX,
  GridCell,
  GridLineY,
  GridCellNumber,
  CellNote,
  CellNoteContainer,
} from "src/components/pages/Game/Sudoku/Sudoku.styles";
import SudokuGame from "src/sudoku-game/SudokuGame";
import {Bounds} from "src/utils/types";
import {Cell, CellCoordinates, DIFFICULTY} from "src/engine/types";
import {flatten} from "src/utils/collection";
import Button from "src/components/modules/Button";
import {formatDuration} from "src/utils/format";

const SudokuGrid = React.memo(
  ({width, height, hideLeftRight = false}: {width: number; height: number; hideLeftRight?: boolean}) => {
    return (
      <div>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const hide = [0, 9].includes(i);
          if (hideLeftRight && hide) {
            return null;
          }
          const makeBold = [3, 6].includes(i);
          return <GridLineX makeBold={makeBold} key={i} width={width} top={(i * height) / 9} />;
        })}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const hide = [0, 9].includes(i);
          if (hideLeftRight && hide) {
            return null;
          }
          const makeBold = [3, 6].includes(i);
          return <GridLineY makeBold={makeBold} key={i} height={height} left={(i * height) / 9} />;
        })}
      </div>
    );
  },
);

const SudokuCell = React.memo(
  ({
    number,
    active,
    highlight,
    bounds,
    onClick,
    onRightClick,
    left,
    top,
    initial,
    notes,
    notesMode,
    conflict,
    highlightNumber,
  }: {
    number: number;
    active: boolean;
    highlightNumber: boolean;
    highlight: boolean;
    conflict: boolean;
    bounds: Bounds;
    onClick: () => void;
    onRightClick: () => void;
    top: number;
    left: number;
    initial: boolean;
    notes: number[];
    notesMode: boolean;
  }) => {
    return (
      <div>
        <GridCell
          notesMode={notesMode}
          active={active}
          conflict={conflict}
          highlight={highlight}
          highlightNumber={highlightNumber}
          bounds={bounds}
          onClick={onClick}
          onRightClick={onRightClick}
        />
        <GridCellNumber left={left} top={top} initial={initial} highlight={highlightNumber} conflict={conflict}>
          {number !== 0 ? number : ""}
        </GridCellNumber>
        <CellNoteContainer initial={initial} bounds={bounds}>
          {initial || number
            ? null
            : notes.map((n) => {
                const notePosition = SudokuGame.getNotePosition(n);
                return (
                  <CellNote key={n} left={notePosition.x} top={notePosition.y}>
                    {n !== 0 ? n : ""}
                  </CellNote>
                );
              })}
        </CellNoteContainer>
      </div>
    );
  },
);

interface SudokuProps {
  activeCell?: CellCoordinates;
  sudokuId: number;
  sudokuIndex: number;
  difficulty: DIFFICULTY;
  sudoku: Cell[];
  showHints: boolean;
  showWrongEntries: boolean;
  showConflicts: boolean;
  timesSolved: number;
  secondsPlayed: number;
  previousTimes: number[];
  shouldShowMenu: boolean;
  notesMode: boolean;
  showMenu: typeof showMenu;
  hideMenu: typeof hideMenu;
  selectCell: typeof selectCell;
  restartGame: () => void;
  state: GameStateMachine;
}

export class Sudoku extends React.PureComponent<SudokuProps> {
  _isMounted: boolean = false;
  constructor(props: SudokuProps) {
    super(props);
  }
  componentDidMount() {
    this._isMounted = true;
    window.addEventListener("click", () => {
      if (this.props.activeCell !== null) {
        this.props.hideMenu();
      }
    });
  }

  render() {
    const {sudoku: passedSudoku, showHints, state, activeCell: passedActiveCell} = this.props;
    const paused = state === GameStateMachine.paused;
    const wonGame = state === GameStateMachine.wonGame;
    const sudoku = paused ? emptyGrid : passedSudoku;

    const height = 100;
    const width = 100;

    const xSection = height / 9;
    const ySection = width / 9;

    const activeCell =
      passedActiveCell && !paused && sudoku.find((c) => c.x === passedActiveCell.x && c.y === passedActiveCell.y);
    const selectionPosition = {
      x: (activeCell && activeCell.x) || 0,
      y: (activeCell && activeCell.y) || 0,
    };

    const positionedCells = SudokuGame.positionedCells(sudoku, width, height);
    const conflicting = SudokuGame.conflictingFields(sudoku);
    const uniquePaths = SudokuGame.uniquePaths(
      flatten(
        conflicting.map((c) => {
          return SudokuGame.getPathsFromConflicting(c, sudoku);
        }),
      ),
    );

    const pathCells = flatten(
      uniquePaths.map((p) => {
        return SudokuGame.getPathBetweenCell(p.from, p.to);
      }),
    );

    const friendsOfActiveCell = activeCell ? SudokuGame.sameSquareColumnRow(activeCell, sudoku) : [];

    const onRightClickOnOpenMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (activeCell && this.props.shouldShowMenu) {
        this.props.selectCell(activeCell);
        this.props.showMenu(true);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    return (
      <div className="absolute h-full w-full rounded-sm">
        {wonGame && (
          <div className="absolute top-0 bottom-0 right-0 left-0 z-30 flex items-center justify-center rounded-sm bg-white bg-opacity-80 text-black">
            <div className="grid gap-8">
              <div className="flex justify-center bg-white text-2xl">{"🎉 Congrats, you won! 🎉"}</div>
              <div className="text-md flex justify-center bg-white">
                <div className="grid">
                  <div className="flex justify-center">{`You solved this sudoku ${this.props.timesSolved} ${
                    this.props.timesSolved === 1 ? "time" : "times"
                  }`}</div>
                  <div className="flex justify-center">
                    <div>
                      {this.props.previousTimes.length > 0 && (
                        <div>{`Best time: ${formatDuration(Math.min(...this.props.previousTimes))}`}</div>
                      )}
                      <div>{`This time: ${formatDuration(this.props.secondsPlayed)}`}</div>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="bg-teal-700 text-white" onClick={() => this.props.restartGame()}>
                Play again
              </Button>
            </div>
          </div>
        )}
        <SudokuGrid width={width} height={height} hideLeftRight />
        {sudoku.map((c, i) => {
          const onClick = () => {
            if (paused) {
              return;
            }
            this.props.selectCell(c);
            if (!c.initial) {
              this.props.showMenu();
            }
          };
          1;
          const onRightClick = () => {
            this.props.selectCell(c);
            if (!c.initial) {
              this.props.showMenu(true);
            }
          };
          const position = positionedCells[i];
          const conflicted = conflicting[i];

          const notes = showHints && c.notes.length === 0 ? conflicted.possibilities : c.notes;

          const inConflictPath =
            this.props.showConflicts &&
            pathCells.some((d) => {
              return d.x === c.x && d.y === c.y;
            });

          const bounds: Bounds = {
            width: xSection,
            height: ySection,
            left: xSection * c.x,
            top: ySection * c.y,
          };

          const isActive = !wonGame && activeCell ? c.x === activeCell.x && c.y === activeCell.y : false;
          const highlight =
            !wonGame &&
            friendsOfActiveCell.some((cc) => {
              return cc.x === c.x && cc.y === c.y;
            });
          const isWrong = !wonGame && this.props.showWrongEntries && (c.number === 0 ? false : c.solution !== c.number);
          const highlightNumber = !wonGame && activeCell && c.number !== 0 ? activeCell.number === c.number : false;

          return (
            <SudokuCell
              key={i}
              active={isActive}
              highlight={highlight}
              highlightNumber={highlightNumber && !isActive}
              conflict={inConflictPath || isWrong}
              bounds={bounds}
              onClick={onClick}
              onRightClick={onRightClick}
              left={position.x}
              top={position.y}
              notes={notes}
              number={c.number}
              initial={c.initial}
              notesMode={this.props.notesMode}
            />
          );
        })}
        {!wonGame && activeCell && this.props.shouldShowMenu ? (
          <MenuContainer
            onContextMenu={(e) => onRightClickOnOpenMenu}
            bounds={{
              top: ySection * selectionPosition.y,
              left: xSection * selectionPosition.x,
              height: ySection,
              width: xSection,
            }}
          >
            <MenuWrapper>
              <SudokuMenuCircle cell={activeCell} />
            </MenuWrapper>
          </MenuContainer>
        ) : null}
      </div>
    );
  }
}
