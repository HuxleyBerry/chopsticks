let maxFingers = 4;
let remainders = false;

let maxDepth = 25;

// actions:
// 0: tap with left hand to l   eft hand
// 1: tap with left hand to right hand
// 2: tap with right hand to left hand
// 3: tap with right hand to right hand
// n - 100: transfer n fingers from left hand to right hand
function minimax(state, currentPlayer, currentDepth, alpha, beta, firstMove, nodeCount) {
    nodeCount++;
    if (isTerminal(state) || currentDepth === maxDepth) {
        return [evaluate(state), nodeCount];
    }
    if (currentPlayer == 0) { // max
        let possibleActions = getActions(state, currentPlayer);
        let maxUtility = -1000;
        let bestAction;
        for (const action of possibleActions) {
            let newState = performAction(state, currentPlayer, action);
            let [resultUtility, newNodeCount] = minimax(newState, 1, currentDepth + 1, alpha, beta, false, nodeCount);
            nodeCount = newNodeCount;
            if (firstMove) {
                console.log(`action ${action} has utility ${resultUtility}. ${alpha} ${beta}`);
            }
            if (resultUtility > maxUtility) {
                maxUtility = resultUtility;
                bestAction = action;
            }
            if (resultUtility > alpha) {
                // alpha is the lower bound for the score max can guarantee
                // We just found that max can achieve a utility of at least resultUtility, so we update alpha
                alpha = resultUtility;
            }
            if (resultUtility >= beta) {
                // beta is the upper bound for the score min can guarantee
                // This means that maximum utility of the all the actions max could do is bigger than beta
                // Thus, we know min will not choose this branch
                // We can tell this without continuing the loop, so we break.
                break;
            }
        };
        if (firstMove) {
            console.log()
            return [bestAction, nodeCount]; // if this the first move, then we care about the move taken, so we return that instead of the utility
        } else {
            return [maxUtility, nodeCount];
        }
    } else if (currentPlayer == 1) { // min
        let possibleActions = getActions(state, currentPlayer);
        let minUtility = 1000;
        for (const action of possibleActions) {
            let newState = performAction(state, currentPlayer, action);
            let [resultUtility, newNodeCount] = minimax(newState, 0, currentDepth + 1, alpha, beta, false, nodeCount);
            nodeCount = newNodeCount;
            if (resultUtility < minUtility) {
                minUtility = resultUtility;
            }
            if (resultUtility < beta) {
                beta = resultUtility;
            }
            if (resultUtility <= alpha) {
                break;
            }
        };
        return [minUtility, nodeCount]
    }
}

function getActions(state, currentPlayer) {
    let actions = [];
    // By symmetry, we can assume that fingers will always be transferred in such a way to leave more on equal on the right hand
    let maxAllowedTransfer = Math.min(maxFingers - state[currentPlayer * 2 + 1], state[currentPlayer * 2])
    let minAllowedTransfer = Math.ceil((state[currentPlayer * 2] - state[currentPlayer * 2 + 1]) / 2)
    for (let i = minAllowedTransfer; i <= maxAllowedTransfer; i++) {
        // Transferring 0 fingers would be like skipping a move
        // Also, transferring the difference is like skipping a move
        // Both of these are banned
        if (i !== 0 && i !== state[currentPlayer * 2] - state[currentPlayer * 2 + 1]) {
            actions.push(i - 100);
        }
    }
    if (state[0] !== 0) {
        if (state[2] !== 0) {
            addToActionListHeuristically(actions, state, currentPlayer, 0);
        }
        if (state[3] !== 0 && state[3] !== state[2]) {
            addToActionListHeuristically(actions, state, currentPlayer, 1 + currentPlayer);
        }
    } if (state[1] !== 0 && state[1] !== state[0]) {
        if (state[2] !== 0) {
            addToActionListHeuristically(actions, state, currentPlayer, 2 - currentPlayer);
        }
        if (state[3] !== 0 && state[3] !== state[2]) {
            addToActionListHeuristically(actions, state, currentPlayer, 3);
        }
    }
    return actions;
}

function moveKillsHand(state, currentPlayer, move) {
    const tappingHand = Math.floor(move / 2) + 2 * currentPlayer;
    const tappedHand = 2 * (1 - currentPlayer) + move % 2;
    const fingerSum = state[tappedHand] + state[tappingHand];
    return fingerSum > maxFingers && (!remainders || fingerSum === maxFingers + 1);
}

function addToActionListHeuristically(actionList, state, currentPlayer, move) {
    if (moveKillsHand(state, currentPlayer, move)) {
        // add to the front
        actionList.unshift(move);
    } else {
        actionList.push(move);
    }
}

function evaluate(state) {
    if (state[0] === 0 && state[1] === 0) {
        return -100;
    } else if (state[2] === 0 && state[3] === 0) {
        return 100;
    } else if (state[0] + state[1] === 1 && state[2] + state[3] > 1) {
        // bad to be stuck with just one finger
        return -50;
    } else if (state[2] + state[3] === 1 && state[0] + state[1] > 1) {
        return 50;
    } else {
        return 0;
    }
}

function isTerminal(state) {
    return (state[0] == 0 && state[1] == 0) || (state[2] == 0 && state[3] == 0)
}

function performAction(state, currentPlayer, action) {
    let stateCopy = state.slice()
    if (action >= 0) {
        stateCopy[2 * (1 - currentPlayer) + (action % 2)] += state[2 * currentPlayer + Math.floor(action / 2)];
        if (remainders) {
            stateCopy[2 * (1 - currentPlayer) + (action % 2)] = stateCopy[2 * (1 - currentPlayer) + (action % 2)] % (maxFingers + 1)
        } else if (stateCopy[2 * (1 - currentPlayer) + (action % 2)] > maxFingers) {
            stateCopy[2 * (1 - currentPlayer) + (action % 2)] = 0;
        }
    } else { // a transfer
        // subtract from hand with more fingers and add to hand with less fingers
        stateCopy[2 * currentPlayer] -= (action + 100);
        stateCopy[2 * currentPlayer + 1] += (action + 100);
    }
    return stateCopy;
}

function chooseAction(state) { // computer choosing action
    let [action, nodeCount] = minimax(state, 0, 0, -100, 100, true, 0);
    console.log(`examined ${nodeCount} nodes`);
    return action;
}