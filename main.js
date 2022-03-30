// déclaration
const EMPTY = "EMPTY";
const WALL = "WALL";
const FOOD = "FOOD";
const SNAKE = "SNAKE";
const CELLSIZE = 15;

let levels;
let world = [];
let snake = [];

// listeners
window.addEventListener('load', load);
window.addEventListener('hashchange', generateWorld);
document.addEventListener('keydown', step, false);


async function load() {
    const response = await fetch("level.json");
    if (response.ok) {
        levels = await response.json();
    } else {
        throw("Error " + response.status);
    }
    
    displayLevels();
}


function displayLevels() 
{
    var mainDiv = document.createElement("div");
    mainDiv.className = 'cards';
    mainDiv.id = 'cards';

    for (var i = 0; i < levels.length; i++) {
        var card = document.createElement("div");
        var anchor = document.createElement("a");
        var title = document.createElement("h3");
        var description = document.createElement("p");

        var titleNode = document.createTextNode("Niveau " + i + " (" + levels[i].niveau + ")");
        title.appendChild(titleNode);

        var descriptionNode = document.createTextNode(levels[i].description);
        description.appendChild(descriptionNode);

        anchor.appendChild(title);
        anchor.appendChild(description);
        card.appendChild(anchor);

        mainDiv.appendChild(card);

        anchor.href = '#' + i;

        card.className = 'card';        
        anchor.className = 'fill-div';
    }

    document.body.appendChild(mainDiv);
}


function generateWorld()
{
    if (document.getElementById('cards') != null) {
        var cards = document.getElementById('cards');
        cards.parentNode.removeChild(cards);
    }    

    var iLevel = window.location.hash[1];
    var walls = levels[iLevel].walls;
    var food = levels[iLevel].food;
    snake = levels[iLevel].snake;

    var size = [levels[iLevel].dimensions[0], levels[iLevel].dimensions[1]];

    for (var i = 0; i < size[0]; i++) {
        world[i] = [];
        for (var j = 0; j < size[1]; j++) {
            if (isArrayInArray(walls, [i, j])) {
                world[i][j] = WALL;
            } else if (isArrayInArray(food, [i, j])) {
                world[i][j] = FOOD;
            } else if (isArrayInArray(snake, [i, j])) {
                world[i][j] = SNAKE;
            } else {
                world[i][j] = EMPTY;
            } 
        }
    }

    drawMap();
}

function drawMap()
{
    if (document.getElementById('canvas') === null) {
        var canvas = document.createElement("canvas");
        canvas.width = CELLSIZE * world[0].length;
        canvas.height = CELLSIZE * world.length;
        canvas.id = 'canvas';
        document.body.appendChild(canvas);
    }    

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    var y = 0;
    for (var i = 0; i < world.length; i++) {
        var x = 0;
        for (var j = 0; j < world[0].length; j++) {
            
            // select a style 
            if (world[i][j] === FOOD) {
                ctx.fillStyle = 'red';
            } else if (world[i][j] === SNAKE) {
                ctx.fillStyle = 'green';
            } else if (world[i][j] === WALL) {
                ctx.fillStyle = 'brown';
            } else {
                if (i % 2 == 0) ctx.fillStyle = (j % 2 == 0) ? '#0454b0' : '#4692ea';
                else ctx.fillStyle = (j % 2 == 0) ? '#4692ea' : '#0454b0';
            }

            // then apply to the cell
            ctx.fillRect(x, y, CELLSIZE, CELLSIZE); 

            x += CELLSIZE;
        }
        y += CELLSIZE;
    }
}

function isArrayInArray(array, item)
{
    for (var i = 0; i < array.length; i++) {
        var checker = [];
        for (var j = 0; j < array[i].length; j++) {
            if (array[i][j] === item[j]){
                checker.push(true)
            } else {
                checker.push(false)
            }
        }

        if (checker.every(check => check === true)){
            return true
        }
    }

    return false
}


function step(e)
{
    console.log(e.keyCode);
}