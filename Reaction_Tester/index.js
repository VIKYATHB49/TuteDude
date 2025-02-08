const startButton = document.getElementById('startButton');
const intro = document.getElementById('intro');
const gameArea = document.getElementById('gameArea');
const alertBox = document.getElementById('alertBox');
const clickSound = document.getElementById('clickSound');
let startTime, totalReactionTime = 0, clickCount = 0;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createRandomBox() {
    const box = document.createElement('div');
    box.className = 'randomBox';
    const size = getRandomInt(30, 100);
    const color = `rgb(${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)})`;
    const borderSize = getRandomInt(1, 3); 
    const borderRadius = `${getRandomInt(0, 30)}%`;
    const top = getRandomInt(0, window.innerHeight - size); 
    const left = getRandomInt(0, window.innerWidth - size); 

    box.style.width = `${size}px`;
    box.style.height = `${size}px`;
    box.style.backgroundColor = color;
    box.style.border = `${borderSize}px solid black`;
    box.style.borderRadius = borderRadius;
    box.style.top = `${top}px`;
    box.style.left = `${left}px`;

    box.addEventListener('click', () => {
        clickSound.play();

        const reactionTime = Date.now() - startTime;
        totalReactionTime += reactionTime / 1000;
        const avg = totalReactionTime / 10;
        clickCount++;
        box.remove();

        if (clickCount < 10) {
            startTime = Date.now();
            createRandomBox();
        } else {
            const message = getReactionCategory(avg);
            document.getElementById("alertBox").style.display = "block";
            document.getElementById("Head").innerHTML = `Your Average Reaction Time is: ${(avg).toFixed(2)} seconds`;

            document.getElementById("para").innerHTML = `${message}`;
            result();
        }
    });

    gameArea.appendChild(box);
}

function getReactionCategory(avg) {
    if (avg < 0.45) {
        return "You are in the Top 1%! Excellent reflexes!";
    } else if (avg > 0.45 && avg < 0.65) {
        return "You are in the Top 5%! Great job!";
    } else if (avg > 0.65 && avg < 0.75) {
        return "You are in the Top 50%! Good effort";
    } else if (avg > 0.75 && avg < 0.85) {
        return "Not bad! Keep improving!";
    } else if (avg > 0.85 && avg < 1.0) {
        return "Not impressive! Work on your reflexes!";
    }else if (avg > 1.0 && avg < 1.5) {
        return "You Surpass my database! You are least in my database";
    } 
    else {
        return "Don't play games. Go and study!"; 
    }
}

function result() {
    gameArea.style.display = 'none';
    alertBox.style.display = 'block';
    totalReactionTime = 0;
    clickCount = 0;
}

function re() {
    totalReactionTime = 0;
    clickCount = 0;
    alertBox.style.display = 'none';
    gameArea.style.display = 'block';  
    startTime = Date.now();
    createRandomBox(); 
}

startButton.addEventListener('click', () => {
    intro.style.display = 'none';
    gameArea.style.display = 'block';
    startTime = Date.now();
    createRandomBox();
});