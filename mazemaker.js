
var mazeMakerInitialized = false;

var drawingIsActive = false;

function handleMouseOver(cell) {
    if(drawingIsActive) {
        if(isCellSet(cell)) {
            cell.setAttribute("isset", "");
            cell.style.backgroundColor = "white";
        }
        else {
            cell.setAttribute("isset", "1");
            cell.style.backgroundColor = "black";
        }
        outputCoords();
    }
}

function initMazeMaker() {

    if(mazeMakerInitialized) return;

    getObj("mazetable").onmousedown = function() {
        drawingIsActive = true;
    }

    getObj("mazetable").onmouseup = function() {
        drawingIsActive = false;
    }

    for(var row = 0; row < MAZE_NUMBER_OF_ROWS; row++) {
        for(var col = 0; col < MAZE_NUMBER_OF_COLS; col++) {
            getObj(row+","+col).onmouseover = function() {
                handleMouseOver(this);
            }
            getObj(row+","+col).onclick = function() {
                drawingIsActive = true;
                handleMouseOver(this);
                drawingIsActive = false;
            }
        }
    }

    mazeMakerInitied = true;
}

function outputCoords() {

    mazeOutput = getObj("mazemaker_output");

    maze = "mazeCoords = [";

    notFirstTime = false;

    for(var row = 0; row < MAZE_NUMBER_OF_ROWS; row++) {
        for(var col = 0; col < MAZE_NUMBER_OF_COLS; col++) {
            cell = getObj(row+","+col);
            
            if(isCellSet(cell) && !isStartCell(cell) && !isGoalCell(cell)) {
                maze += notFirstTime ? "," : "";
                maze += '"' + row+","+col + '"';
                notFirstTime = true;
            }
        }
    }

    maze += "];";

    mazeOutput.innerHTML = maze;
}

