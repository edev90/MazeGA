
var mazeGridArray = new Array();

var currentCell = null;

const MAZE_NUMBER_OF_ROWS = 50;
const MAZE_NUMBER_OF_COLS = 50;

const MOUSE_START_X = 15;
const MOUSE_START_Y = 0;

const CHEESE_GOAL_X = 42;
const CHEESE_GOAL_Y = 48;

const ANIMATION_SPEED = 50;
const CHROMOSOME_LEN = 300;
const POPULATION_SIZE = 200;

const distFromStartToGoal = distance(MOUSE_START_X, MOUSE_START_Y, CHEESE_GOAL_X, CHEESE_GOAL_Y)

var GENE_COUNTER = 0;
const MOVE_UP = GENE_COUNTER++;
const MOVE_DOWN = GENE_COUNTER++;
const MOVE_LEFT = GENE_COUNTER++;
const MOVE_RIGHT = GENE_COUNTER++;

const DO_ANIMATION = true;
const NO_ANIMATION = false;

var MOUSE_TEST_OBJ = "<div style='width:100%; height:100%;background-color:rgb(150,150,150);'></div>";

var mousePosition = new function() {
    this.x = 0;
    this.y = 0;
}

// For debugging and testing purposes
var outputBox = null;

function getObj(id) {return document.getElementById(id);}

function initMaze() {
    mazeToUse = null;
    if(mazeCoords) {
        // a specific maze was supplied, let's build a lookup we can use in the following loop
        // to determine which cells should be filled in
        mazeToUse = [];
        for(coord of mazeCoords) {
            mazeToUse[coord] = true;
        }
    }

    isMazeWall = function(coord) {
        return mazeToUse != null && mazeToUse[coord];
    }

    for(var row = 0; row < MAZE_NUMBER_OF_ROWS; row++) {
        for(var col = 0; col < MAZE_NUMBER_OF_COLS; col++) {
            if(mazeGridArray[row] == undefined) {
                mazeGridArray[row] = new Array();
            }
            mazeGridArray[row][col] = getObj(row+","+col);
            if(isMazeWall(row+","+col)) {
                mazeGridArray[row][col].setAttribute("isset", "1");
                mazeGridArray[row][col].style.backgroundColor = "black";
            }
            else {
                mazeGridArray[row][col].setAttribute("isset", "");
                mazeGridArray[row][col].style.backgroundColor = "white";
            }
            // If these are the cells that contain the cheese bg pic -- overwrite every other setting and make the cell transparent
            if(col >= 40 && col <= 43 && row >= 47 && row <= 50) {
                mazeGridArray[row][col].setAttribute("isset", "");
                mazeGridArray[row][col].style.background = "none";
            }
        }
    }
    // // add some set cells to the maze to test it
    // for testing purposes only
    // for(var i = 0; i < 1000; i++) {
    //     x = (Math.random()*50)|0;
    //     y = (Math.random()*50)|0;
    //     getObj(x+","+y).setAttribute("isset", "1");
    //     getObj(x+","+y).style.backgroundColor = "black";
    // }
}

function isStartCell(cell) {
    return cell.id == MOUSE_START_X+","+MOUSE_START_Y;
}

function isGoalCell(cell) {
    return cell.id == CHEESE_GOAL_X+","+CHEESE_GOAL_Y;
}

function isCellSet(cell) {
    return cell.getAttribute("isset").trim() == "1";
}

GeneIterator = function(chromosome) {
    this.chromosome = chromosome;
    this.size = this.chromosome.length;
    this.geneIndex = 0;
    this.nextGene = function() {
        if(this.geneIndex < this.size) {
            return this.chromosome[this.geneIndex++];
        }
        return null;
    }
    this.hasNext = function() {
        return this.geneIndex < this.size;
    }
    this.reset = function() {
        this.geneIndex = 0;
    }
}

function processGene(gene, doAnimation) {
    oldX = mousePosition.x;
    oldY = mousePosition.y;

    switch(gene) {
        case MOVE_UP:    mousePosition.y -= 1; break;
        case MOVE_DOWN:  mousePosition.y += 1; break;
        case MOVE_LEFT:  mousePosition.x -= 1; break;
        case MOVE_RIGHT: mousePosition.x += 1; break;
        default: outputBox.value += "Unsupported gene function";
    }

    if(mousePosition.x < 0 || mousePosition.x >= MAZE_NUMBER_OF_COLS
            || mousePosition.y < 0 || mousePosition.y >= MAZE_NUMBER_OF_ROWS
            || isCellSet(mazeGridArray[mousePosition.y][mousePosition.x])) {

        // if new position is out of bounds, or we've hit the cell wall, then revert to old position, and then exit func
        mousePosition.x = oldX;
        mousePosition.y = oldY;
        return;
    }

    // Otherwise we're good to go and update the mouse's new position accordingly:
    if(doAnimation) {
        setMouseAtPos(mousePosition.x, mousePosition.y);
    }
}

// This func has one purpose: process one chromosome and assess its fitness (percentage)
// 0% = 0.0 (totally unfit), 
// 100% = 1.0 (fit - solution)
function assessChromosomeFitness(chromosome) {

    // reset the mouse's position at the start of each evaluation
    mousePosition.x = MOUSE_START_X;
    mousePosition.y = MOUSE_START_Y;

    var reachedGoal = false;
    if(chromosome == null) {
        return 0;
    }
    for(gene of chromosome) {
        processGene(gene, NO_ANIMATION);
        if(mousePosition.x == CHEESE_GOAL_X && mousePosition.y == CHEESE_GOAL_Y) {
            reachedGoal = true;
            break; // we reached our goal so we don't need to keep processing further genes
        }
    }
    // Outside loop, we're done processing genes

    var fitness = 0;
    
    // If we're exactly on the target cell, simply return 1.0 for 100% fitness
    if(reachedGoal) {
        fitness = 1;
    }
    else {
        fitness = distFromStartToGoal - distance(mousePosition.x, mousePosition.y, CHEESE_GOAL_X, CHEESE_GOAL_Y);
        fitness = fitness / distFromStartToGoal;
    }

    // reset mouse pos so we don't conflict with other funcs
    mousePosition.x = MOUSE_START_X;
    mousePosition.y = MOUSE_START_Y;

    return Math.max(fitness, 0);
}

const animationController = new function() {
    this.at = null; // animation timer
    this.currentChromosome = null;
    this.geneIterator = null;
    this.callbackFunc = null;
    this.paused = false;

    this.skipCount = -1;

    this.animateMouse = function(chromosome, callbackFunc) {
        if(this.at == null) {
            this.currentChromosome = chromosome;
            this.geneIterator = new GeneIterator(this.currentChromosome);
            this.callbackFunc = callbackFunc;
            this.at = setInterval("animationController.animateMouse()", ANIMATION_SPEED); // timing doesn't really matter much...
            return;
        }
        
        if(this.paused) {
            return;
        }

        var finished = false;

        if(this.geneIterator.hasNext()) {
            var gene = this.geneIterator.nextGene();
            processGene(gene, DO_ANIMATION);
        }
        else {
            finished = true;
        }

        if(this.doSkip()) {
            finished = true;
            this.skipCount--;
        }
        else {
            this.skipCount = -1;
        }

        if(finished) {
            clearInterval(this.at);
            this.at = null;
            this.currentChromosome = null;
            this.geneIterator = null;
            if(this.callbackFunc && this.callbackFunc != null) {
                this.callbackFunc();
            }
        }
    }

    this.doSkip = function() {
        return this.skipCount >= 0;
    }

    this.startSkip = function(skipCount) {
        this.skipCount = skipCount;
    }
}

/*
    chromosome -- array of genes
    mRate -- mutation rate
*/
function mutate(chromosome, mRate, numFunctions) {
    var cLen = chromosome.length;
    for(var gene = 0; gene < cLen; gene++) {
        if(mRate == 1.0 || Math.random() <= mRate) {
            chromosome[gene] = (Math.random() * numFunctions)|0; // bitwise OR to strip the decimal
        }
    }
}

function createChromosome(chromosomeLen) {
    chromosome = [];
    for(var i = 0; i < chromosomeLen; i++) {
        chromosome.push(0);
    }
    return chromosome;
}

const mainController = new function() {

    this.generationNum = 0;
    this.populationSize = 0;
    this.currentGeneration = [];
    this.rouletteWheel = [];

    this.fittestChromosome = null;
    this.fittestChromosomeFitness = 0;

    this.leastFitChromosome = null;
    this.leastFitChromosomeFitness = 0;

    this.maxGenerations = 1000;

    this.mutationRate = 0.02;

    // select a random 
    this.chooseRandomChromosomeFromWheel = function() {
        var sizeOfWheel = this.rouletteWheel.length;
        return this.rouletteWheel[(Math.random() * sizeOfWheel) | 0];
    }

    this.buildInitialGeneration = function() {
        setStatusCaption("Building the initial population...");
        
        // build initial population
        for(var c = 0; c < this.populationSize; c++) {
            chromosome = createChromosome(CHROMOSOME_LEN);
            mutate(chromosome, 1.0, 4);
            this.currentGeneration.push(chromosome);
        }
    }

    this.assessFitnessOfCurrentGeneration = function() {
        this.fittestChromosome = null;
        this.fittestChromosomeFitness = 0;

        this.leastFitChromosome = null;
        this.leastFitChromosomeFitness = 0;

        this.rouletteWheel = [];

        setStatusCaption("Assessing fitness of current generation [generation: " + this.generationNum + "].");

        var startIndex = 0;
        for(chromosome of this.currentGeneration) {
            fitness = assessChromosomeFitness(chromosome);

            if(this.fittestChromosome == null || fitness > this.fittestChromosomeFitness) {
                this.fittestChromosome = chromosome;
                this.fittestChromosomeFitness = fitness;
            }

            if(this.leastFitChromosome == null || fitness < this.leastFitChromosomeFitness) {
                this.leastFitChromosome = chromosome;
                this.leastFitChromosomeFitness = fitness;
            }

            sliceAmount = (fitness * 100) | 0;
            for(i = startIndex; i <= startIndex + sliceAmount; i++) {
                this.rouletteWheel[i] = chromosome;
            }
        }
    }

    this.buildCurrentGeneration = function() {

        newGeneration = [];

        // build current population
        for(var c = 0; c < this.populationSize; c++) {

            offspringChromosome = [];

            // do crossover
            parent1 = this.chooseRandomChromosomeFromWheel();
            parent2 = this.chooseRandomChromosomeFromWheel();

            var chromosomeLen = parent1.length;
            for(var gene = 0; gene < chromosomeLen; gene++) {
                // roll the dice & decide which 'parent' to inherit the current gene from
                offspringChromosome.push(Math.random < 0.5 ? parent1[gene] : parent2[gene]); 
            }

            mutate(offspringChromosome, this.mutationRate, 4);

            newGeneration.push(offspringChromosome);
        }

        this.currentGeneration = newGeneration;
    }

    // called after we play the animation (of the fittest individual)
    this.animationCallBack = function() {

        // check if we should run for another generation, or if we're finished
        if(mainController.fittestChromosomeFitness == 1.0 || mainController.generationNum >= mainController.maxGenerations) {
            // end evolution
        }
        else {
            mainController.generationNum++;
            mainController.times++;
            mainController.doEvolution();
        }
    }

    this.playBackFittestIndividual = function() {
        setStatusCaption("Playing back fittest individual from generation " + this.generationNum + ". Fitness: " + this.fittestChromosomeFitness);
        // If fitness is 1.0, then we're done, so stop skip, play back the winner and stop
        if(this.fittestChromosomeFitness == 1.0) {
            animationController.skipCount = -1;
        }
        animationController.animateMouse(this.fittestChromosome, mainController.animationCallBack);
    }

    this.doEvolution = function(populationSize) {

        if(populationSize) {
            this.populationSize = populationSize;
        }

        if(this.generationNum == 0) {
            this.buildInitialGeneration();
        }
        else {
            this.buildCurrentGeneration();
        }

        this.assessFitnessOfCurrentGeneration();

        this.playBackFittestIndividual();
    }
}

function setMouseAtPos(xPos, yPos) {
    if(currentCell != null) {
        currentCell.setAttribute("isset", ""); 
        currentCell.innerHTML = "";
    }
    currentCell = mazeGridArray[yPos][xPos];
    currentCell.setAttribute("isset", "1");
    currentCell.innerHTML = MOUSE_TEST_OBJ;
}

function distance(cellX1, cellY1, cellX2, cellY2) {
    return Math.sqrt(Math.pow((cellX2 - cellX1), 2) + Math.pow((cellY2 - cellY1), 2));
}

function doMutateTest() {
    chromosome = new Array(10);
    for(var i = 0; i < 10; i++) {
        mutate(chromosome, 1.0, 4);
        outputBox.value += outputBox.value.trim().length > 0 ? "\n" : "";
        outputBox.value += chromosome;
    }
}

function doBasicFitnessTests() {
    outputBox.value += "\n----Fitness tests----";
    testChromosomes = [
        [], // should be 0
        [MOVE_LEFT, MOVE_LEFT, MOVE_LEFT, MOVE_LEFT], // should be 0
        [MOVE_DOWN, MOVE_DOWN, MOVE_DOWN, MOVE_DOWN] 
    ];

    longTest = [];
    for(var i = 0; i < 100; i++) {
        longTest.push(i%2 == 0 ? MOVE_RIGHT : MOVE_DOWN);
    }
    testChromosomes.push(longTest); // should be pretty damn close to 1

    lastTest = [MOVE_LEFT, MOVE_LEFT, MOVE_RIGHT, MOVE_RIGHT, MOVE_DOWN, MOVE_DOWN];
    testChromosomes.push(lastTest);

    for(testChromosome of testChromosomes) {
        let result = testChromosome + " fitness: " + assessChromosomeFitness(testChromosome);
        outputBox.value += outputBox.value.trim().length > 0 ? "\n" : "";
        outputBox.value += result;
    }
}

function doAnimationTest() {
    chromosome = new Array(100);
    mutate(chromosome, 1.0, 4);
    setMouseAtPos(0,0);
    animationController.animateMouse(chromosome);
}

function doTests() {
    outputBox = getObj("tests_output");
    outputBox.value = "";
    
    // mutate test
    doMutateTest(outputBox);

    // basic fitness test
    doBasicFitnessTests();

    // animation test
    doAnimationTest();
}

function setStatusCaption(status) {
    getObj("status_lbl").innerHTML = status;
}

// Called once everything on page loads
function init() {
    setStatusCaption("Initializing...");
    initMaze();
    setMouseAtPos(MOUSE_START_X, MOUSE_START_Y);
    //doTests();
    setStatusCaption("");
    
    urlObj = new URL(window.location.href);
    searchParams = new URLSearchParams(urlObj.search);

    // If startEvolution param exists in url, start the evolution upon loading
    if(searchParams.get("startEvolution")) {
        mainController.doEvolution(POPULATION_SIZE);
    }
}

function getBasePageURL() {
    url = window.location.href;
    if(url.indexOf("?") > -1) {
        paramsStart = url.indexOf("?");
        url = url.substring(0, paramsStart);
    }
    return url;
}

// Easy way of handling a restart -- just refresh page!
function restartEvolution() {
    window.location.href = getBasePageURL() + "?startEvolution=1";
}

function refresh() {
    window.location.href = getBasePageURL();
}

// When the user presses the 'skip aninmation' button, we won't play the fittest individual
// playback for skipCount # of generations
function fastForward() {
    skipCount = getObj("skipcount").value.trim() * 1;
    if(skipCount >= 1) {
        animationController.startSkip(skipCount);
    }
}

function togglePausePlay() {
    animationController.paused = !animationController.paused;
    togglePausePlayBtn = getObj("Toggle_Pause_Play");
    if(animationController.paused) {
        togglePausePlayBtn.value = "Resume Playback";
    }
    else {
        togglePausePlayBtn.value = "Pause Playback";
    }
}