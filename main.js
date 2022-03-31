// déclaration
const EMPTY = 0;
const SNAKE = 1;
const FOOD = 2;
const WALL = 3;

let canvas = null;
let ctx = null;
let levels = null;
let level = null;
let food = null;
let walls = null;
let snakeBody = [];
let world = [];

// listeners
window.addEventListener('load', load);
window.addEventListener('hashchange', generateWorld);

// chargement initial de la page
async function load() {

    // on récupère tous les niveaux
    const response = await fetch("level.json");
    if (response.ok) {
        levels = await response.json();
    } else {
        throw("Error " + response.status);
    }

    // on charge les sprites de manière cachée
    var img = document.createElement("img");
    img.src = 'assets/apple.png';
    img.id = 'apple';
    img.hidden = 'true';
    document.body.appendChild(img);

    var img = document.createElement("img");
    img.src = 'assets/wall.jpg';
    img.id = 'wall';
    img.hidden = 'true';
    document.body.appendChild(img);
    
    // on affiche tous les niveaux
    displayLevels();
}

// manipulation de l'arbre DOM pour afficher tous les niveaux
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


// remplir le tableau 2D illustrant le monde
function generateWorld()
{
    if (document.getElementById('cards') != null) {
        var cards = document.getElementById('cards');
        cards.parentNode.removeChild(cards);
    }    

    level = levels[window.location.hash.split("#")[1]];

    walls = level.walls;
    food = level.food;
    snakeBody = level.snake;

    for (var i = 0; i < level.dimensions[0]; i++) {
        world[i] = [];
        for (var j = 0; j < level.dimensions[1]; j++) {
            if (isArrayInArray(walls, [i, j])) {
                world[i][j] = WALL;
            } else if (isArrayInArray(food, [i, j])) {
                world[i][j] = FOOD;
            } else if (isArrayInArray(snakeBody, [i, j])) {
                world[i][j] = SNAKE;
            } else {
                world[i][j] = EMPTY;
            } 
        }
    }

    drawMap();
}

// dessine la matrice dans le canvas HTML
function drawMap()
{
    // si c'est le premier appel à la méthode, le canvas n'existe pas
    if (document.getElementById('canvas') === null) {
        var canvas = document.createElement("canvas");
        canvas.width = level.cellSize * world[0].length;
        canvas.height = level.cellSize * world.length;
        canvas.id = 'canvas';
        document.body.appendChild(canvas);
    }    

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // on récupère la tête et la queue pour les dessiner spécifiquement
    if (snakeBody.length > 1) {
        var head = snakeBody[snakeBody.length - 1];
        var tail = snakeBody[0];    
    } else {
        var head = snakeBody[snakeBody.length - 1];
        var tail = null;   
    }
    
    // effectue le dessin
    var y = 0;
    for (var i = 0; i < world.length; i++) {
        var x = 0;
        for (var j = 0; j < world[i].length; j++) {

            // les cases sont remplies avec des couleurs alternées pour les differencier
            if (i % 2 == 0) ctx.fillStyle = (j % 2 == 0) ? '#0454b0' : '#4692ea';
            else ctx.fillStyle = (j % 2 == 0) ? '#4692ea' : '#0454b0';
            ctx.fillRect(x, y, level.cellSize, level.cellSize); 
            
            // applique les styles propres à chaque état du monde
            if (world[i][j] === FOOD) {                
                ctx.drawImage(document.getElementById('apple'), x, y, level.cellSize, level.cellSize);
            } else if (world[i][j] === SNAKE) {
                if (i == head[0] && j == head[1]) {
                    // dessine sa tête
                    ctx.beginPath();
                    ctx.arc(x + level.cellSize/2, y + level.cellSize/2, level.cellSize/2, 0, 2 * Math.PI);
                    ctx.fillStyle = 'green';
                    ctx.fill();
                } else if (tail != null && i == tail[0] && j == tail[1]) {
                    // dessine sa queue, si elle existe (si le corps du serpent fait au moins 2 cases)
                    ctx.beginPath();
                    ctx.arc(x + level.cellSize/2, y + level.cellSize/2, level.cellSize/4, 0, 2 * Math.PI);
                    ctx.fillStyle = 'green';
                    ctx.fill();
                } else {
                    // dessine les morceaux du corps
                    ctx.beginPath();
                    ctx.arc(x + level.cellSize/2, y + level.cellSize/2, level.cellSize/3, 0, 2 * Math.PI);
                    ctx.fillStyle = 'green';
                    ctx.fill();
                }
            } else if (world[i][j] === WALL) {
                ctx.drawImage(document.getElementById('wall'), x, y, level.cellSize, level.cellSize);
            }

            x += level.cellSize;
        }
        y += level.cellSize;
    }
}

// vérifier si un tableau est contenu dans une matrice
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

