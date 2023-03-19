import {useEffect, useRef, useState} from 'react'
import './App.css'
import blueCandy from './images/blue-candy.png'
import greenCandy from './images/green-candy.png'
import orangeCandy from './images/orange-candy.png'
import purpleCandy from './images/purple-candy.png'
import redCandy from './images/red-candy.png'
import yellowCandy from './images/yellow-candy.png'
import blank from './images/blank.png'

const WIDTH = 8
const candyColors = [
    blueCandy,
    orangeCandy,
    purpleCandy,
    redCandy,
    yellowCandy,
    greenCandy
]

const App = () => {
    const [candies, setCandies] = useState([])
    const currentCandies = useRef([])
    const [candieDragged, setCandieDragged] = useState(null)
    const [candieToReplace, setCandieToReplace] = useState(null)
    const [score, setScore] = useState(0)

    const playSound = (id) => {
        document.getElementById(id).play();
    }

    const updateScore = (num) => {
        setScore((score) => score + num)
    }

    const animateRow = (row) => {
        const elem = document.createElement('div');
        elem.classList.add('animate')
        elem.style.left = 0;
        elem.style.top = `${row*70 + 35 + 20}px`;
        elem.style.width = 0;
        elem.style.height = '5px';

        document.querySelector('.game').append(elem)

        setTimeout(() => {
            elem.classList.add('animateRow')

            setTimeout(() => {
                elem.remove();
            }, 100);
        }, 100);
    }

    const animateCol = (col) => {
        const elem = document.createElement('div');
        elem.classList.add('animate')
        elem.style.top = 0;
        elem.style.left = `${col*70 + 35 + 20}px`;
        elem.style.height = 0;
        elem.style.width = '5px';

        document.querySelector('.game').append(elem)

        setTimeout(() => {
            elem.classList.add('animateCol')

            setTimeout(() => {
                elem.remove();
            }, 100);
        }, 100);
    }

    const setRowToBlank = (index) => {
        const row = Math.floor(index/WIDTH);

        for (let i = row*WIDTH; i < (row*WIDTH + WIDTH); i++) {
            currentCandies.current[i].color = blank
            currentCandies.current[i].modifier = ''
        }
        updateScore(WIDTH)
        animateRow(row)
        playSound('line_blast')
    }

    const setColToBlank = (index) => {
        const col = index % WIDTH;

        for (let i = 0; i < WIDTH; i++) {
            currentCandies.current[col + i*WIDTH].color = blank
            currentCandies.current[col + i*WIDTH].modifier = ''
        }
        updateScore(WIDTH)
        animateCol(col)
        playSound('line_blast')
    }

    const checkForColumns = (num, indexes=null) => {
        for (let i = 0; i < (WIDTH*WIDTH - (num-1)*WIDTH); i++) {
            const columns = [];

            for (let j = 0; j < num; j++) {
                columns.push(i + j*WIDTH)
              
            }
            const decidedColor = currentCandies.current[i].color
            const isBlank = currentCandies.current[i].color === blank

            if (columns.every(square => currentCandies.current[square].color === decidedColor && !isBlank)) {
                updateScore(num)

                let specialCnadyIndex = -1;
                if(num > 3){
                    specialCnadyIndex = columns.findIndex(col => indexes?.includes(col));
                    if(specialCnadyIndex === -1) specialCnadyIndex = 0;
                    playSound('striped_candy_created')
                }
                for (let j = 0; j < columns.length; j++) {
                  
                  if(j === specialCnadyIndex){
                    currentCandies.current[columns[j]].modifier = 'horizontal';
                    continue;
                  }

                  if(currentCandies.current[columns[j]].modifier){
                    if(currentCandies.current[columns[j]].modifier === 'vertical') setColToBlank(columns[j]);
                    if(currentCandies.current[columns[j]].modifier === 'horizontal') setRowToBlank(columns[j])
                  }else{
                    currentCandies.current[columns[j]].color = blank
                    currentCandies.current[columns[j]].modifier = ''
                  }
                  
                }
                return true
            }
        }
    }

    const checkForRows = (num, indexes=null) => {
        for (let i = 0; i < WIDTH*WIDTH; i++) {
            const rows = [];
            for (let j = 0; j < num; j++) {
                rows.push(i + j);
            }

            const decidedColor = currentCandies.current[i].color
            const isBlank = currentCandies.current[i].color === blank

            if (WIDTH - (i % WIDTH) < num) continue

            if (rows.every(square => currentCandies.current[square].color === decidedColor && !isBlank)) {
                updateScore(num)

                let specialCnadyIndex = -1;
                if(num > 3){
                    specialCnadyIndex = rows.findIndex(row => indexes?.includes(row));
                    if(specialCnadyIndex === -1) specialCnadyIndex = 0;
                    playSound('striped_candy_created')
                }

                for (let j = 0; j < rows.length; j++) {
                  
                  if(j === specialCnadyIndex){
                    currentCandies.current[rows[j]].modifier = 'vertical';
                    continue;
                  }

                  if(currentCandies.current[rows[j]].modifier){
                    if(currentCandies.current[rows[j]].modifier === 'vertical') setColToBlank(rows[j]);
                    if(currentCandies.current[rows[j]].modifier === 'horizontal') setRowToBlank(rows[j])
                  }else{
                    currentCandies.current[rows[j]].color = blank
                    currentCandies.current[rows[j]].modifier = ''
                  }

                  
                }
                return true
            }
        }
    }

    const moveIntoSquareBelow = () => {
        for (let i = 0; i < (WIDTH*WIDTH - WIDTH); i++) {
            const isFirstRow = i<WIDTH

            if (isFirstRow && currentCandies.current[i].color === blank) {
                let randomNumber = Math.floor(Math.random() * candyColors.length)
                currentCandies.current[i].color = candyColors[randomNumber]
                currentCandies.current[i].modifier = ''
            }

            if ((currentCandies.current[i + WIDTH].color) === blank) {
                currentCandies.current[i + WIDTH].color = currentCandies.current[i].color
                currentCandies.current[i + WIDTH].modifier = currentCandies.current[i].modifier
                currentCandies.current[i].color = blank
                currentCandies.current[i].modifier = ''
            }
        }
    }

    const dragStart = (e) => {
        setCandieDragged(e.target)
    }
    const dragDrop = (e) => {
        setCandieToReplace(e.target)
    }
    const dragEnd = () => {
        const candieDraggedIndex = parseInt(candieDragged.getAttribute('data-index'))
        const candieToReplaceIndex = parseInt(candieToReplace.getAttribute('data-index'))

        const validMoves = [
            candieDraggedIndex - 1,
            candieDraggedIndex - WIDTH,
            candieDraggedIndex + 1,
            candieDraggedIndex + WIDTH
        ]

        const validMove = validMoves.includes(candieToReplaceIndex)

        if(!validMove) return;

        //Check of 2 modified candies
        if(currentCandies.current[candieToReplaceIndex].modifier && currentCandies.current[candieDraggedIndex].modifier){

            setRowToBlank(candieToReplaceIndex)
            setColToBlank(candieToReplaceIndex)
            return;
        }

        currentCandies.current[candieToReplaceIndex].color = candieDragged.getAttribute('data-src')
        currentCandies.current[candieToReplaceIndex].modifier = candieDragged.getAttribute('data-modifier')
        
        currentCandies.current[candieDraggedIndex].color = candieToReplace.getAttribute('data-src')
        currentCandies.current[candieDraggedIndex].modifier = candieToReplace.getAttribute('data-modifier')

        const isAColumnOfFour = checkForColumns(4, [candieToReplaceIndex, candieDraggedIndex])
        const isARowOfFour = checkForRows(4, [candieToReplaceIndex, candieDraggedIndex])
        const isAColumnOfThree = checkForColumns(3, [candieToReplaceIndex, candieDraggedIndex])
        const isARowOfThree = checkForRows(3, [candieToReplaceIndex, candieDraggedIndex])

        if (candieToReplaceIndex &&
            (isARowOfThree || isARowOfFour || isAColumnOfFour || isAColumnOfThree)) {
            setCandieDragged(null)
            setCandieToReplace(null)
        } else {
            currentCandies.current[candieToReplaceIndex].color = candieToReplace.getAttribute('data-src')
            currentCandies.current[candieToReplaceIndex].modifier = candieToReplace.getAttribute('data-modifier')

            currentCandies.current[candieDraggedIndex].color = candieDragged.getAttribute('data-src')
            currentCandies.current[candieDraggedIndex].modifier = candieDragged.getAttribute('data-modifier')
            playSound('negative_switch')
        }
    }


    const createBoard = () => {
        const randomCandies = []
        for (let i = 0; i < WIDTH * WIDTH; i++) {
            const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)]
            randomCandies.push({color: randomColor})
        }
        setCandies(randomCandies)
        currentCandies.current = randomCandies
    }

    useEffect(() => {
        createBoard()

        const timer = setInterval(() => {
            checkForColumns(4)
            checkForRows(4)
            checkForColumns(3)
            checkForRows(3)
            moveIntoSquareBelow()
            setCandies([...currentCandies.current])
        }, 100)
        return () => clearInterval(timer)
    }, [])


    return (
        <div className="app">
            <div className="score-board">
              <span>Score : </span><b>{score}</b>
            </div>
            <div className="game">
                {candies.map(({color, modifier}, index) => (
                    <div
                      key={index}
                      className={`img-container ${(color !== blank && modifier)? modifier : ''}`}
                      data-src={color}
                      data-index={index}
                      data-modifier={modifier}
                      draggable={true}
                      onDragStart={dragStart}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={(e) => e.preventDefault()}
                      onDragLeave={(e) => e.preventDefault()}
                      onDrop={dragDrop}
                      onDragEnd={dragEnd}
                    >
                      <img
                          src={color}
                          alt={color}
                      />
                    </div>
                ))}
            </div>
            
        </div>
    )
}

export default App

