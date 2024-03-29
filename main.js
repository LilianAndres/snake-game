// jshint browser:true, eqeqeq:true, undef:true, devel:true, esnext: true

// déclaration
const EMPTY = 0;
const SNAKE = 1;
const FOOD = 2;
const WALL = 3;

let canvas = null;
let divCanvas = null;
let ctx = null;
let levels = null; // charge le json
let level = null; // charge le niveau séléctionné
let food = null;  // identifie la nourriture
let blocks = null;  // contient les blocs (murs, glaces...)
let snakeDirection = null;  // stocke la direction actuelle
let snakeBody = [];
let world = [];
let hasEaten = false;

let run = false;
let countRun = 0 ; 
let idInterval = null;
let gameOver = false ;
let countInterval = 0;

let score = 0 ; 

var eatAudio = document.createElement("audio");
var collisionAudio = document.createElement("audio");
var music = document.createElement("audio");


// listeners
window.addEventListener('load', load);
window.addEventListener('hashchange', generateWorld);
music.addEventListener('ended',playMusic);
document.addEventListener('keydown', changeDirection, false);

function load() {

    let url = "http://localhost/snake-js/level.json";

    fetch(url).then(function(response) {

        if(response.ok) {
            return response.json();
        } else {
            throw("Error " + response.status);
        }
    
    }).then(function(data) {
    
        eatAudio.src = "assets/audio/eat.mp3";
        collisionAudio.src = "assets/audio/collision.mp3";
        music.src = "assets/audio/soundtrack.mp3";
        music.volume = 0.1;
        eatAudio.volume = 0.1;
        collisionAudio.volume = 0.1;


        playMusic();    
        levels = data;

        // on charge les sprites de manière cachée
        var img = document.createElement("img");
        img.src = 'assets/apple.png';
        img.id = 'apple';
        img.hidden = 'true';
        document.body.appendChild(img);

        img = document.createElement("img");
        img.src = 'assets/rock.png';
        img.id = 'wall';
        img.hidden = 'true';
        document.body.appendChild(img);

        img = document.createElement("img");
        img.src = 'assets/ice.png';
        img.id = 'ice';
        img.hidden = 'true';
        document.body.appendChild(img);
        
        // on affiche tous les niveaux
        displayLevels();
    
    }).catch(function(err) {
    
        console.log(err);
    
    });
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

        var titleNode = document.createTextNode("Niveau " + (i + 1) + " (" + levels[i].niveau + ")");
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

    playMusic();

    // on initie toutes les variables qui vont nous servir quand on charge le niveau
    level = levels[window.location.hash.split("#")[1]];
    blocks = level.blocks;    
    food = Object.values(level.food);
    snakeBody = Object.values(level.snake);

    switch(level.direction) {
        case "RIGHT": 
            snakeDirection  = { name: level.direction, x: 1, y: 0 };
            break;
        case "LEFT": 
            snakeDirection = { name: level.direction, x: -1, y: 0 };
            break;
        case "BOTTOM": 
            snakeDirection = { name: level.direction, x: 0, y: 1 };
            break;
        case "TOP": 
            snakeDirection = { name: level.direction, x: 0, y: -1 };
            break;
    }

    // génération de la matrice world
    for (var i = 0; i < level.dimensions[1]; i++) {
        world[i] = [];
        for (var j = 0; j < level.dimensions[0]; j++) {
            if (isArrayInArray(blocks.walls, [i, j])) {
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

    // affichage de world
    drawMap();
}

// dessine la matrice dans le canvas HTML
function drawMap()
{
    if (document.getElementById('div-canvas') === null) {
        var div = document.createElement("div");
        div.id = 'div-canvas';
        document.body.appendChild(div);
        divCanvas = div ;
    }

    // si c'est le premier appel à la méthode, le canvas n'existe pas
    if (document.getElementById('canvas') === null) {
        var c = document.createElement("canvas");
        c.id = 'canvas';
        divCanvas.appendChild(c);
    }

    if (document.getElementById('aside') === null) {
        var divAside = document.createElement("aside");
        divAside.id = 'aside';
        divCanvas.appendChild(divAside);
    }

    if (document.getElementById('food') === null) {
        var txtFood = document.createElement("p");
        txtFood.id = 'food';
        txtFood.textContent = "Score: " + score;
        document.getElementById("aside").appendChild(txtFood);
    }   

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // efface le canvas existant à chaque actualisation 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var scale = (window.innerHeight - canvas.offsetTop) / level.dimensions[0];

    canvas.width = scale * level.dimensions[1];
    canvas.height = scale * level.dimensions[0];

    // on récupère la tête et la queue pour les dessiner spécifiquement
    var head = null;
    var tail = null;
    if (snakeBody.length > 1) {
        head = snakeBody[snakeBody.length - 1];
        tail = snakeBody[0];    
    } else {
        head = snakeBody[snakeBody.length - 1];
        tail = null;   
    }
    
    // effectue le dessin
    for (var i = 0; i < level.dimensions[1]; i++) {
        for (var j = 0; j < level.dimensions[0]; j++) {

            // les cases sont remplies avec des couleurs alternées pour les differencier
            if (i % 2 === 0) ctx.fillStyle = (j % 2 === 0) ? '#7bd57d' : '#46a011';
            else ctx.fillStyle = (j % 2 === 0) ? '#46a011' : '#7bd57d';
            ctx.fillRect(i * scale, j * scale, scale, scale); 
            
            // applique les styles propres à chaque état du monde
            if (world[i][j] === FOOD) {                
                ctx.drawImage(document.getElementById('apple'), i * scale, j * scale, scale, scale);
            } else if (world[i][j] === SNAKE) {
                ctx.beginPath();                
                if (i === head[0] && j === head[1]) {
                    // dessine sa tête                    
                    ctx.arc(i * scale + scale/2, j * scale + scale/2, scale/2, 0, 2 * Math.PI);                    
                } else if (tail !== null && i === tail[0] && j === tail[1]) {
                    // dessine sa queue, si elle existe (si le corps du serpent fait au moins 2 cases)
                    ctx.arc(i * scale + scale/2, j * scale + scale/2, scale/4, 0, 2 * Math.PI);
                } else {
                    // dessine les morceaux du corps
                    ctx.arc(i * scale + scale/2, j * scale + scale/2, scale/3, 0, 2 * Math.PI);
                }
                ctx.fillStyle = '#4a78f2';
                ctx.fill();
                ctx.strokeStyle = 'black';
                ctx.stroke();
            } else if (world[i][j] === WALL) {
                ctx.drawImage(document.getElementById('wall'), i * scale, j * scale, scale, scale);
            }
        }
    }
}

// vérifier si un tableau est contenu dans une matrice
function isArrayInArray(array, item)
{
    for (var i = 0; i < array.length; i++) {
        var checker = [];
        for (var j = 0; j < array[i].length; j++) {
            if (array[i][j] === item[j]){
                checker.push(true);
            } else {
                checker.push(false);
            }
        }

        if (checker.every(check => check === true)){
            return true;
        }
    }
    return false;
}


function step()
{   

    var txtFood = document.getElementById('food');
    txtFood.textContent = "Score: " + score;

    if(run && !gameOver){          

        // disparition de la nourriture
        countInterval += 1;
        if(countInterval === Math.round(level.repopFood / level.delay)) depopFood(); 

        // définit la future position de la tête du serpent
        var newx = snakeBody[snakeBody.length-1][0] + snakeDirection.x;
        var newy = snakeBody[snakeBody.length-1][1] + snakeDirection.y;
        
        if (!obstacle(newx,newy)) {

            if (world[newx][newy] === FOOD) {
                eat();
            }

            moveSnake(newx, newy);   
            hasEaten = false;  // le serpent a terminé de manger
        }

        drawMap();
        if(gameOver){
            drawGameOver(score);
            deleteInterval();
            
        }

    }
    else {
        i++;
    }
}


function eat() 
{
    eatAudio.play();
    generateNewFood(); 
    countInterval = 0;   
    score++;
    hasEaten = true;     

    // accélération de la course du serpent toutes les n pommes (avec n = level.acceleration)
    if (level.calculAcceleration.acceleration !== 0 && score !== 0 && score % level.calculAcceleration.score === 0 && (level.delay - level.calculAcceleration.acceleration) > 0) {
        clearInterval(idInterval);
        level.delay -= level.calculAcceleration.acceleration;
        idInterval = setInterval(step, level.delay);
    }
}

function moveSnake(x, y)
{
    const tail = snakeBody[0];

    snakeBody.push([x, y]);
    if (!hasEaten) snakeBody.shift();

    world[x][y] = SNAKE;
    world[tail[0]][tail[1]] = EMPTY;
}

function changeDirection(e){
    
    if(!run  && countRun===0){
        running();
        run = true;
        countRun++;
    }

    if (e.keyCode === 37 && snakeDirection.name !== "RIGHT"){
        // left 
        snakeDirection.name = "LEFT";
        snakeDirection.x = -1;
        snakeDirection.y = 0;
    }
    else if(e.keyCode === 38 && snakeDirection.name !== "BOTTOM"){
        // top
        snakeDirection.name = "TOP";
        snakeDirection.x = 0;
        snakeDirection.y = -1;   
    }
    else if(e.keyCode === 39 && snakeDirection.name !== "LEFT" ){
        // right
        snakeDirection.name = "RIGHT";
        snakeDirection.x = 1;
        snakeDirection.y = 0;   
    }
    else if(e.keyCode === 40 && snakeDirection.name !== "TOP" ){
        // bottom
        snakeDirection.name = "BOTTOM";
        snakeDirection.x =  0;
        snakeDirection.y = 1;   
    }
}

// pose une nouvelle case de nourriture sur le monde
function generateNewFood()
{
    var x = Math.floor(Math.random() * (level.dimensions[1])); 
    var y = Math.floor(Math.random() * (level.dimensions[0])); 

    if(!isArrayInArray(blocks.walls, [x, y]) && !isArrayInArray(snakeBody, [x, y])) {
        world[x][y] = FOOD;
        food[0][0] = x;
        food[0][1] = y;
    } else {
        generateNewFood();
    }
}

function depopFood()
{
    world[food[0][0]][food[0][1]] = EMPTY;
    generateNewFood();
    countInterval = 0;
}


function obstacle(x,y)
{
    // si le serpent touche un rebord, un mur ou se mord la queue
    if(x < 0 || x > world.length - 1 || y < 0 || y > world[0].length - 1 || isArrayInArray(blocks.walls, [x, y]) || isArrayInArray(snakeBody, [x, y])) {
        collisionAudio.play();
        run = false;
        gameOver = true;
        return true;
    }
    return false ;
}

function running()
{   
    idInterval = setInterval(step, level.delay);
}

function drawGameOver (score){

    // Création des images 
    var imgretry = document.createElement("img");
    imgretry.src = 'assets/retry.png';
    imgretry.id = 'retry';
    imgretry.width = 40;
    var imgHome = document.createElement("img");
    imgHome.src = 'assets/home.png';
    imgHome.id = 'home';
    imgHome.width = 40;
    
    // Création de la div game over et de la div contenant les boutons 
    var divGameOver = document.createElement("div");
    divGameOver.id= "div-game-over";
    var divButton = document.createElement("div");
    divButton.id= "div-button";

    // Création des boutons pour relancer le niveau et retouner a l'accueil
    var buttonRetry = document.createElement("button");
    buttonRetry.id = "button-retry";
    var buttonHome = document.createElement("button");
    buttonHome.id = "button-home";
    
    // Création du texte game over et le texte contenant le score
    var textGameOver = document.createElement("p");
    textGameOver.id ="text-game-over"
    textGameOver.textContent = "Game Over" ;
    var textScore = document.createElement("p");
    textScore.id ="text-score"
    textScore.textContent = "Score: "+score ;

    // Affection des functions sur les boutons  
    buttonHome.onclick = home;
    buttonRetry.onclick= restart;

    // Intégrations des différents éléments 
    divGameOver.appendChild(textGameOver);
    divGameOver.appendChild(textScore);
    divGameOver.appendChild(divButton);
    divButton.appendChild(buttonRetry); 
    divButton.appendChild(buttonHome); 
    document.body.appendChild(divGameOver);
    buttonRetry.appendChild(imgretry);
    buttonHome.appendChild(imgHome);

}

function restart(){

    var divGameOver = document.getElementById('div-game-over');

    // suppression de la div game over
    divGameOver.parentNode.removeChild(divGameOver);

    // renitialisation des variables 
    gameOver = false ; 
    score = 0;
    
    // on vide le tableau contenant la position du snake et celui de la nourriture 
    snakeBody.pop();
    food.pop();

    // on regenere le monde 
    generateWorld();

    countRun = 0;
}

function deleteInterval(){
    clearInterval(idInterval);
}

function home (){
    window.location = window.location.href.split("#")[0]
}

function playMusic(){
    music.play();
}
