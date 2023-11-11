let fingersList = [1, 1, 1, 1];
const imgList = ["0.png", "1.png", "2.png", "3.png", "4.png", "5.png"];
const posAdjustments = [[0, 0], [0, 0], [-1, -10], [-1, -9], [-10, -12], [-29, -5]];

const escButton = document.getElementById("esc-button");
escButton.style.display = "none";
const dropdown = document.getElementById("dropdown");
dropdown.style.display = "none";
const dropdownContent = document.getElementById("dropdown-content");
const handElements = [0, 1, 2, 3].map(n => document.getElementById(`hand${n}`))

let startingPlayer = "you";
let enemyTurn = false;
let gameOver = true;
let animationStart, previousTimeStep;
const ENEMY_MOVE_LENGTH = 1000; // in milliseconds

function drawHands(flist) {
    // indices 0 and 1 correspond to the computer's hands, 2 and 3 correspond to the player's hands

    handElements[0].src = imgList[flist[0]]
    handElements[0].style.left = 100 + posAdjustments[flist[0]][0] + "px";
    handElements[0].style.top = 100 - posAdjustments[flist[0]][1] + "px";
    handElements[0].style.transform = "scale(1,-1)";

    handElements[1].src = imgList[flist[1]]
    handElements[1].style.left = 300 - posAdjustments[flist[1]][0] + "px";
    handElements[1].style.top = 100 - posAdjustments[flist[1]][1] + "px";
    handElements[1].style.transform = "scale(-1,-1)";

    handElements[2].src = imgList[flist[2]]
    handElements[2].style.left = 100 + posAdjustments[flist[2]][0] + "px";
    handElements[2].style.top = 500 + posAdjustments[flist[2]][1] + "px";

    handElements[3].src = imgList[flist[3]]
    handElements[3].style.left = 300 - posAdjustments[flist[3]][0] + "px";
    handElements[3].style.top = 500 + posAdjustments[flist[3]][1] + "px";
    handElements[3].style.transform = "scale(-1,1)";
};

drawHands(fingersList);

let selectedHand = -1;

function toggleButtonVisibility(show) {
    if (show) {
        escButton.style.display = "block";
        dropdown.style.display = "inline-block";
    } else {
        escButton.style.display = "none";
        dropdown.style.display = "none";
    }
}

function selectHand(event) {
    if (selectedHand == -1 && enemyTurn == false && !gameOver) {
        selectedHand = event.target == handElements[2] ? 0 : 1;
        makeTransferOptions();
        toggleButtonVisibility(true);
    }
}

function tapHand(event) {
    if (selectedHand == -1) { // if neither hand is selected to tap with, return
        return;
    }
    let tappedHandIndex = event.target == handElements[0] ? 0 : 1;
    if (handElements[tappedHandIndex] == 0) { // tapping empty hands does nothing
        return;
    }
    respondToGameStart();
    let action = selectedHand * 2 + tappedHandIndex;
    fingersList = performAction(fingersList, 1, action);
    completePlayerTurn();
}


function reset() {
    selectedHand = -1;
    toggleButtonVisibility(false);
    drawHands(fingersList);
}

function completePlayerTurn() {
    reset();
    if (fingersList[0] === 0 && fingersList[1] === 0) {
        endGame(1);
    } else {
        performEnemyTurn();
    }
}
function calcAllowedTransfers(sel, oth) {
    if (sel == 0) {
        return [];
    } else {
        var allowed = [];
        for (let i = 1; i <= sel; i++) {
            if (i != sel - oth && oth + i <= maxFingers) {
                allowed.push(i)
            }
        }
        return allowed;
    }
};

function transferFingers() {
    respondToGameStart();
    let transferAmount = this.innerHTML[0]
    let action = (1 - selectedHand * 2) * transferAmount - 100
    fingersList = performAction(fingersList, 1, action);
    completePlayerTurn();
};

function makeTransferOptions() {
    dropdownContent.innerHTML = "";
    if (selectedHand === 0) {
        var allowed = calcAllowedTransfers(fingersList[2], fingersList[3]);
    } else {
        var allowed = calcAllowedTransfers(fingersList[3], fingersList[2]);
    }
    for (let i = 0; i < allowed.length; i++) {
        let newOption = document.createElement("button")
        dropdownContent.appendChild(newOption);
        newOption.className = "transfer-button";
        newOption.addEventListener("click", transferFingers);
        if (allowed[i] == 1) {
            newOption.innerHTML = "1 finger";
        } else {
            newOption.innerHTML = `${allowed[i]} fingers`;
        }
    }
}

function mouseMoved(event) {
    if (selectedHand !== -1) {
        handElements[selectedHand + 2].style.left = event.clientX + "px";
        handElements[selectedHand + 2].style.top = event.clientY + "px";
    }
}

function performEnemyTurn() {
    enemyTurn = true;
    let move = chooseAction(fingersList);
    window.requestAnimationFrame((timestep) => moveHand(timestep, move));
    fingersList = performAction(fingersList, 0, move);
};

function moveHand(timestep, move) {
    if (animationStart === undefined) {
        animationStart = timestep;
        previousTimeStep = timestep;
    }
    let elapsed = timestep - animationStart;
    if (move >= 0) { // move isn't a transfer
        let movingHandElement = handElements[Math.floor(move / 2)]
        let crossing = move === 1 ? 1 : (move === 2 ? -1 : 0);
        movingHandElement.style.top = parseFloat(movingHandElement.style.top) + (timestep - previousTimeStep) * 0.2 + "px";
        movingHandElement.style.left = parseFloat(movingHandElement.style.left) + (timestep - previousTimeStep) * 0.2 * crossing + "px";
    }
    previousTimeStep = timestep;
    if (elapsed < ENEMY_MOVE_LENGTH) {
        window.requestAnimationFrame((timestep) => moveHand(timestep, move));
    } else {
        animationStart = undefined;
        drawHands(fingersList);
        enemyTurn = false;
        if (fingersList[2] === 0 && fingersList[3] === 0) {
            endGame(0);
        }
    }
};
function toggleSettingAccess(allowAccess) {
    document.querySelectorAll('#options-div > input').forEach(input => {
        input.disabled = allowAccess;
    })
}


function endGame(winner) {
    gameOver = true;
    document.getElementById("play-again").textContent = "Reset";
    if (winner === 0) {
        alert("YOU LOSE");
    } else {
        alert("YOU WIN!");
    }
}

function respondToGameStart() {
    toggleSettingAccess(true);
    document.getElementById("play-again").style.display = "block";
}

function restart(event) {
    let buttonText = event.target.textContent;
    if (buttonText === "Reset") {
        fingersList = [1, 1, 1, 1];
        toggleSettingAccess(false);
        drawHands(fingersList);
        event.target.textContent = "Start Game";
    } else {
        gameOver = false;
        toggleSettingAccess(true);
        event.target.textContent = "Reset";
        if (startingPlayer === "opponent") {
            enemyTurn = true;
            performEnemyTurn();
        } else {
            enemyTurn = false;
        }
    }
}

document.querySelectorAll('input[name="first-player"]').forEach(radioButton => {
    radioButton.onclick = () => {
        startingPlayer = radioButton.value;
    };
});
document.querySelectorAll('input[name="max-fingers"]').forEach(radioButton => {
    radioButton.onclick = () => {
        maxFingers = parseInt(radioButton.value);
    };
});
document.getElementById("remainders-checkbox").onclick = (event) => {
    remainders = event.target.checked;
};
document.getElementById("depth-slider").onchange = (event) => {
    event.target.nextElementSibling.textContent = event.target.value;
    maxDepth = parseInt(event.target.value);
}

handElements[0].onclick = tapHand;
handElements[1].onclick = tapHand;
handElements[2].onclick = selectHand;
handElements[3].onclick = selectHand;
document.getElementById("play-again").onclick = restart;
window.addEventListener("mousemove", mouseMoved);