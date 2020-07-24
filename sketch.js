let grid = [                                                                     // game state
  ['e', 'b', 'b', 'n'],                                                          // must start with r|b|e|n
  ['e', 'b', 'r', 'e'],                                                          // may end with d
  ['e', 'b', 'r', 'e'],
  ['n', 'r', 'r', 'e']
];
let player = 'r';                                                                // current player (r|b)
let firstMove = true;                                                            // first move or second move?
const correctMoves = [                                                           // all possible normalized
  "00010122",                                                                    // configurations of L tetromno
  "00010120",
  "01112012",
  "01110012",
  "00120111",
  "00120100",
  "01221101",
  "01220001"
];
let selected = false;                                                            // coordinates of selected neutral piece or false if none selected

let imgE, imgN, imgR, imgB;                                                      // images
let playername, ins1, ins2, moves, canvasParent;                                        // DOM elements

function preload() {                                                             // load images before canvas loads
  imgE = loadImage('images/board.png');
  imgN = loadImage('images/buttonN.png');
  imgR = loadImage('images/buttonR.png');
  imgB = loadImage('images/buttonB.png');
  playername = select('#playername');                                          // get DOM elements
  ins1 = select('#ins1');
  ins2 = select('#ins2');
  moves = select('#moves');
  canvasParent = select('#canvas');
}

function setup() {
  let cnv = createCanvas(400, 400);                                              // create canvas
  cnv.parent(canvasParent);
  grid = [                                                                       // game state
    ['e', 'b', 'b', 'n'],                                                        // must start with r|b|e|n
    ['e', 'b', 'r', 'e'],                                                        // may end with d
    ['e', 'b', 'r', 'e'],
    ['n', 'r', 'r', 'e']
  ];
  player = 'r';                                                                  // current player (r|b)
  firstMove = true;
  noStroke();
  updateDOM();
}

function draw() {
  background(230);
  image(imgE, 0, 0);
  loopOver((i, j) => {
    drawBox(grid[i][j], j, i);
  })();
}

function mouseDragged() {
  if (firstMove && getBox(mouseX, mouseY)!=false) {                              // if first move and mouse inside canvas
    const cords = getBox(mouseX, mouseY);
    const val = grid[cords[0]][cords[1]];
    const re = new RegExp(`^${player}|e`, '');
    if (!(/d$/.test(val)) && (re.test(val))) {                                   // if it is empty or same color and not currently drawn
      grid[cords[0]][cords[1]] += 'd';                                           // mark as drawn
    }
  }
  // return false;                                                               // return false = event.preventDefault
                                                                                 // do not use this since it disables scrolling on touch devices
                                                                                 // instead use css touch-ation: none on canvas element
}

function mouseReleased() {
  if (firstMove) {                                                               // if first move
    let current = [];
    let drawn = [];
    loopOver((i, j) => {
      if (/d$/.test(grid[i][j])) {
        drawn.push([i, j]);                                                      // save drawn boxes to array
      }
      const re = new RegExp(`^${player}`, '');
      if (re.test(grid[i][j])) {
        current.push([i, j]);                                                    // save players current boxes to array
      }
      grid[i][j] = grid[i][j].replace(/^(.)(.*)/, '$1');                         // clear drawn boxes
    })();

    if (isValid(drawn, current)) {                                               // if correctly drawn
      for (const coord of current) {
        grid[coord[0]][coord[1]] = 'e';                                          // clear current boxes
      }
      for (const coord of drawn) {
        grid[coord[0]][coord[1]] = player;                                       // draw new boxes
      }
      firstMove = false;                                                         // make it second move
      updateDOM();
    }
  } else if (getBox(mouseX, mouseY)!=false) {                                    // if second move and click inside canvas
    const cords = getBox(mouseX, mouseY);
    const val = grid[cords[0]][cords[1]];
    if (!selected) {                                                             // if no neutral piece selected
      if (/^n/.test(val)) {                                                      // if neutral box
        grid[cords[0]][cords[1]] += 'd';                                         // select it
        selected = cords;
        updateDOM();
        return false;                                                            // refer comment on Line 115
      }
    } else {                                                                     // if neutral piece selected
      if (/^e/.test(val) || JSON.stringify(cords)==JSON.stringify(selected)) {   // if empty space or same position
        grid[selected[0]][selected[1]] = 'e';                                    // move it to new position
        selected = false;
        grid[cords[0]][cords[1]] = 'n';
        if (player==='r') {                                                      // change player
          player='b';
        } else {
          player='r';
        }
        firstMove = true;                                                        // make it first move
        updateDOM();
        return false;                                                            // refer comment on Line 115
      }
    }
  }
  // return false;                                                               // FIXED
                                                                                 // return false = event.preventDefault
                                                                                 // disables clickrelease event globally
                                                                                 // without it, touch on mobile behaves weirdly
                                                                                 // moved it inside if statements
                                                                                 // so it only prevents default when on canvas
}

function isValid(drawn, current) {
  if (drawn.length != 4) return false;                                           // length must be 4
  if (JSON.stringify(current) === JSON.stringify(drawn)) return false;           // must be different from current
  const xspan = [drawn[0][0], drawn[1][0], drawn[2][0], drawn[3][0]];
  const yspan = [drawn[0][1], drawn[1][1], drawn[2][1], drawn[3][1]];
  const minx = Math.min(...xspan);
  const miny = Math.min(...yspan);
  const xval = xspan.map(x => x - minx).join('');                                // normalized position
  const yval = yspan.map(y => y - miny).join('');                                // normalized position
  return correctMoves.includes(xval + yval);                                     // must be in list of correct moves
}

function loopOver(_func) {                                                       // utility function
  return () => {                                                                 // executes the passed in function
    for (let i = 0; i < 4; i++) {                                                // for every box
      for (let j = 0; j < 4; j++) {
        _func(i, j);
      }
    }
  }
}

function getBox(_x, _y) {                                                        // returns the box mouse is currently on
  const xpos = Math.floor(_x / 100);
  const ypos = Math.floor(_y / 100);
  if (xpos < 0 || xpos > 3) return false;                                        // or false if mouse is outside
  if (ypos < 0 || ypos > 3) return false;
  return [ypos, xpos];
}

function drawBox(_value, _x, _y) {                                               // draws a box
  if (/^r/.test(_value)) {
    image(imgR, _x*100, _y*100);
  } else if (/^b/.test(_value)) {
    image(imgB, _x*100, _y*100);
  } else if (/^n/.test(_value)) {
    image(imgN, _x*100, _y*100);
  } else {
  }                                                                              // draw box
  if (/d$/.test(_value)) {
    stroke(	59, 121, 212, 100);
    strokeWeight(3);
    fill(155, 187, 233, 100);
    rect(_x * 100 + 2, _y * 100 + 2, 96, 96);                                    // draw highlight
    noStroke();
  }
}

function updateDOM() {                                                           // modify DOM
  playername.html(`Its <span style="color: ${(player=='r'?'#B4395E':'#4D7D1E')}">
    ${(player=='r'?'PlayerOne':'PlayerTwo')}
  </span>'s turn.`);
  if (firstMove) {
    ins1.show();
    ins2.hide();
    moves.show();
    const m = checkMoves();                                                      // when a players turn, show him no. of possible moves
    if (m == 0) {                                                                // if no moves left
      playername.html(`<span style="color: ${(player=='b'?'#B4395E':'#4D7D1E')}">
        ${(player=='b'?'PlayerOne':'PlayerTwo')}
      </span> wins!`);                                                           // player whose turn is over wins
    } else {
      moves.html(`${m} possible moves`);
    }
  } else {
    ins1.hide();
    ins2.show();
    moves.hide();
  }
}

function checkMoves() {
  let possibleMoves = 0;
  const re = new RegExp(`^${player}|^e`, '');
  for (const pos of correctMoves) {                                              // start with basic normalized positions
    for (let i = 0; i < 3; i++) {                                                // offset in y direction
      for (let j = 0; j < 3; j++) {                                              // offset in x direction
        try {                                                                    // inside try-catch bacause horizontal and vertical orientations have different max offset (either 3 or 2)
          if (re.test(grid[ parseInt(pos.substring(0,1)) + i ][ parseInt(pos.substring(4,5)) + j ]) &&
              re.test(grid[ parseInt(pos.substring(1,2)) + i ][ parseInt(pos.substring(5,6)) + j ]) &&
              re.test(grid[ parseInt(pos.substring(2,3)) + i ][ parseInt(pos.substring(6,7)) + j ]) &&
              re.test(grid[ parseInt(pos.substring(3,4)) + i ][ parseInt(pos.substring(7,8)) + j ]) ) {
                  possibleMoves+=1;                                              // if empty or same colred box add 1 to pssible movevs
          }
        } catch {

        }
      }
    }
  }
  return possibleMoves-1;                                                        // subtract 1 because possible moves must not include current position
}



// TODO
// [x] End Detection
// [x] Replay button
// [ ] Undo
// [ ] socket.io multiplayer
