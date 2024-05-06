import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
    return (
        <button className={`square ${props.isWinningSquare ? 'winning' : ''}`} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

function Dropdown(props) {
    const foodItems = ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥒', '🌶', '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'];
    return (
        <select onChange={props.onChange} disabled={props.isDisabled}>
            {foodItems.map((foodItem, index) => (
                <option key={index} value={foodItem}>
                    {foodItem}
                </option>
            ))}
        </select>
    );
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            row: null,
            col: null
        };
    }

    getPoints(r, c) {
        this.setState({ row: r, col: c });
    }

    currentState(i, r, c) {
        this.props.onClick(i);
        this.getPoints(r, c);
    }

    renderSquare(i, r, c) {
        const isWinningSquare = this.props.winnerLine && this.props.winnerLine.includes(i);

        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.currentState(i, r, c)}
                isWinningSquare={isWinningSquare}
            />
        );
    }

    render() {
        let board = [];
        let squareNumber = 0;
        for (let i = 0; i < 3; ++i) {
            let children = [];
            for (let j = 0; j < 3; ++j) {
                children.push(this.renderSquare(squareNumber, i, j));
                squareNumber++;
            }
            board.push(<div className="board-row">{children}</div>);
        }

        return (
            <div>
                Current step: {this.state.row} {this.state.col}
                {board}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            xIsNext: true,
            stepNumber: 0,
            isDisabled: false,
            p1: '🍏',
            p2: '🍏'
        };
    }

    reset() {
        this.setState({
            history: [{
                squares: Array(9).fill(null)
            }],
            xIsNext: true,
            isDisabled: false,
            stepNumber: 0,
        });
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        let current = history[history.length - 1];
        const squares = current.squares.slice();

        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? this.state.p1 : this.state.p2;

        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            isDisabled: true,
            xIsNext: !this.state.xIsNext,
        });
    }

    checkDraw(squares) {
        let isBoardFull = true;
        for (let r = 0; r < 9; r++) {
            if (!squares[r]) {
                isBoardFull = false;
                break;
            }
        }

        return isBoardFull && !calculateWinner(squares);
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    playerOneEmojiChange = (event) => {
        const selectedEmoji = event.target.value;
        this.setState({ p1: selectedEmoji });
    }

    playerTwoEmojiChange = (event) => {
        const selectedEmoji = event.target.value;
        this.setState({ p2: selectedEmoji });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber]
        const winner = calculateWinner(current.squares);
        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move : 'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>Move {move}</button>
                </li>
            )
        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else if (this.checkDraw(current.squares)) {
            status = 'Result: Draw';
        }
        else {
            status = 'Next player: ' + (this.state.xIsNext ? this.state.p1 : this.state.p2);
        }

        return (
            <div className="game">
                <div className="game-board">
                    Select player 1:
                    <Dropdown onChange={this.playerOneEmojiChange} isDisabled={this.state.isDisabled} />

                    <br />
                    <br />

                    Select player 2:
                    <Dropdown onChange={this.playerTwoEmojiChange} isDisabled={this.state.isDisabled} />

                    <br />
                    <br />
                    Winner decides what to eat for lunch.

                    {this.state.p2 !== this.state.p1 ?
                        <Board
                            squares={current.squares}
                            onClick={(i) => this.handleClick(i)}
                            winnerLine={winner}

                        /> :
                        " Select different choices for each player"
                    }
                    <button onClick={() => this.reset()}> Reset Game </button>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>

                </div>
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return lines[i]
        }
    }
    return null;
}
