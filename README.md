# MazeGA

A javascript/html app that illustrates the evolution of genetic algorithms through an evolving animation of a mouse searching for a piece of cheese at the end of the maze. The goal is for the mouse (gray square) to 'find' the cheese at the end of the maze. The evolution progresses until the mouse evolves to the point that the fittest chromosome contains the right step movements to move the mouse into cheese region, in which case Fitness will be 1 (100%) and the simulation will stop.

For each generation, X amount of individuals are generated and then then the fittest individual from the current generation is played back on the maze. You can speed the evolution up by entering the # of generations in the "Skip playback animation for: " box and pressing "Skip". Note that this does not actually skip past building any of the generations, only the animations at the end of each generation. Animations can be paused as well. A lot of the 

There isn't a built-in feature for this, but with a little tweaking you can make your own map for the maze. You'll have to comment out the initMazeMaker(); line in MazeGA.html within the script tags in the body tag. This will add the maze making functionality to the page. Set mazeCoords to an empty array in mazecoords.js if you don't want any of the default maze coordinates to be included in your new ones. Click cells inside the maze table and the coordinates will be The coords dumped at the bottom of the screen should be copied over to the mazecoords.js file when finished. 

Tested in the following browsers:

    - Chrome (works)
    - FireFox (works)
    - Safari (works)
    - Internet Edge (doesn't work)

    Screenshots:

    ![Preview of MazeGA interface](https://github.com/edev90/MazeGA/blob/main/images/MazeGA_Screenshot.png)
  