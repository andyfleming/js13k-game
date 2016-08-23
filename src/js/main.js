
import './libs/tiny-canvas.js';

import Sprite from './classes/sprite.js';


/**
 * Tiny-Canvas Canvas
 * @type {TCCanvas}
 */
var CANVAS = TC(document.getElementById('c'));

/**
 * Tint-Canvas
 * @type {TCGLContext}
 */
var GL = CANVAS.g;

/**
 * Is RIGHT key pressed
 * @type {Boolean}
 */
var RIGHT = false;

/**
 * Is LEFT key pressed
 * @type {Boolean}
 */
var LEFT = false;

/**
 * Is JUMP Key pressed
 * @type {Boolean}
 */
var JUMP = false;

/**
 * Number of Jumps
 * @type {Number}
 */
var JUMPS = 2;

/**
 * Positive jump speed
 * @type {Number}
 */
var JUMP_SPEED = 8;
/**
 * Direction Player is facing
 * R = right L = left
 * @type {String}
 */
var DIR = 'R';

/**
 * is Player touching the ground
 * @type {Boolean}
 */
var GROUND = true;

/**
 * Player walk speed
 * @type {Number}
 */
var WALK_SPEED = 1;

/**
 * Top Player walk speed
 * @type {Number}
 */
var TOP_SPEED = 4;

/**
 * Number of images whose load has completed
 * @type {Number}
 */
var IMAGES_LOADED = 0;

/**
 * Total Number of images expected to load
 * @type {Number}
 */
var TOTAL_IMAGES = 1;

/**
 * Player Sprite object
 * @type {Sprite}
 */
var Player = {};

/**
 * Player .png
 * @type {Image}
 */
var PlayerImage = new Image();

/**
 * Player image as Tiny-Canvas Texture
 * @type {TCTexture}
 */
var PlayerTexture = null;

/**
 * List of frames in the Player Image
 * @type {Array}
 */
var PlayerFrames = [
  [0, 0, 16, 20],
  [16, 0, 16, 20],
  [32, 0, 16, 20],
  [48, 0, 16, 20],
  [64, 0, 16, 20]
];
/**
 * TODO: Add desc
 * @type {Number}
 */
var GRAVITY = 0.5;

/**
 * Proxy func for Math.random
 * @type {Function}
 * @returns {Number} Between 0 & 1
 */
var rand = Math.random();

/**
 * Canvas Width (256)
 * @type {Number}
 */
var MAX_X = CANVAS.c.width;

/**
 * Canvas X Origin
 * @type {Number}
 */
var MIN_X = 0;

/**
 * Canvas Height (256)
 * @type {Number}
 */
var MAX_Y = CANVAS.c.height;

/**
 * Canvas Y Origin
 * @type {Number}
 */
var MIN_Y = 0;

/**
 * Array of objects to push to the update + draw functions
 * @type {Array}
 */
var DisplayObjectArray = [];

var currentFrame = 0;
var frameCount = 0;


/**
 * Sets source on all images to start loading
 */
function load() {
  PlayerImage.src = 'person_cut_tiny.png';
}

/**
 * Fired on every load, will call create once last image has loaded
 */
function loadComplete() {
  if (IMAGES_LOADED !== TOTAL_IMAGES) return;
  create();
}

/**
 * Creates all sprites
 */
function create() {
  Player = new Sprite(20, 0, PlayerTexture, PlayerFrames[currentFrame]);

  CANVAS.bkg(0.227, 0.227, 0.227);

  mainLoop();
}

/**
 * MAIN LOOP UPDATE
 * very hot code path, try not to make many function calls
 * only read and set values if at all possible
 */
function update() {
  /**
   * HANDLE KEY PRESSES
   * update player speeds by preset speeds
   */
  if (RIGHT) {
    Player.speedX = Math.min(Player.speedX + WALK_SPEED, TOP_SPEED);
    // currentFrame += 1;
    // if (PlayerFrames.length - 1 === currentFrame) {
    //   currentFrame = 0;
    // }
  }

  if (LEFT) {
    Player.speedX = Math.max(Player.speedX - WALK_SPEED, -TOP_SPEED);
  }

  if (GROUND && (RIGHT || LEFT)) {
    if (frameCount % 4 === 0) {
      currentFrame = (PlayerFrames.length - 1 === currentFrame) ? 0 : ++currentFrame;
      Player.updateFrame(PlayerFrames[currentFrame]);
    }
    frameCount++;
  } else if (GROUND) {
    currentFrame = 4;
    Player.updateFrame(PlayerFrames[currentFrame]);
  } else {
    currentFrame = 0;
    Player.updateFrame(PlayerFrames[currentFrame]);
  }

  if (JUMP && GROUND) {
    Player.speedY = -JUMP_SPEED;
    GROUND = false;
    JUMPS -= 1;
  }

  if (JUMP && !GROUND && JUMPS > 0 && Player.speedY > -5) {
    Player.speedY = -JUMP_SPEED;
    GROUND = false;
    JUMPS -= 1;
  }

  /**
   * Update player to new position
   */
  Player.posX += Player.speedX;
  Player.posY += Player.speedY;

  /**
   * Update Player gravity
   */
  Player.speedY += GRAVITY;

  /**
   * Apply friction to player if they're walking
   */
  if (Math.abs(Player.speedX) < 1) {
    Player.speedX = 0;
  } else if (GROUND) {
    Player.speedX *= 0.8;
  } else {
    Player.speedX *= 0.95;
  }

  /**
   * Clamp Player to Canvas
   */
  if (Player.posY + Player.height >= MAX_Y) {
    Player.posY = MAX_Y - Player.height;
    Player.speedY = 0;
    GROUND = true;
    JUMPS = 2;
  } else if (Player.posY < MIN_Y) {
    Player.posY = MIN_Y;
  }

  if (Player.posX > MAX_X) {
    Player.speedX *= -1;
    Player.posX = MAX_X;
  } else if (Player.posX < MIN_X) {
    Player.speedX *= -1;
    Player.posX = MIN_X;
  }
}

/**
 * MAIN LOOP DRAW
 * very hot code path, try not to make many function calls
 * only read and set values if at all possible
 */
function draw() {
  /**
   * Clear canvas
   */
  CANVAS.cls();

  CANVAS.push();
  CANVAS.trans(Player.posX, Player.posY);
  CANVAS.rot(Player.rotation);

  if (DIR === 'R') {
    CANVAS.scale(1, 1);
  } else {
    CANVAS.scale(-1, 1);
  }

  CANVAS.img(
    PlayerTexture,
    -Player.halfWidth,
    0,
    Player.width,
    Player.height,
    Player.u0,
    Player.v0,
    Player.u1,
    Player.v1
  );

  CANVAS.pop();

  CANVAS.flush();
}

/**
 * MAIN GAME LOOP
 */
function mainLoop() {
  requestAnimationFrame(mainLoop);
  update();
  draw();
}

/**
 * Handler for keyUp events
 * @param  {Event} event Any key presses
 */
document.onkeydown = function (event) {
  if (event.keyCode === 37) {
    LEFT = true;
    DIR = 'L';
    event.preventDefault();
  } else if (event.keyCode === 38) {
    JUMP = true;
    event.preventDefault();
  } else if (event.keyCode === 39) {
    RIGHT = true;
    DIR = 'R';
    event.preventDefault();
  }
};

/**
 * Handler for keyDown events
 * @param  {Event} event Any key up
 */
document.onkeyup = function (event) {
  if (event.keyCode === 37) {
    LEFT = false;
  } else if (event.keyCode === 38) {
    JUMP = false;
  } else if (event.keyCode === 39) {
    RIGHT = false;
  }
};

/**
 * Callback for image load
 * @return {[type]} [description]
 */
PlayerImage.onload = function () {
  PlayerTexture = TCTex(GL, PlayerImage, PlayerImage.width, PlayerImage.height);
  IMAGES_LOADED += 1;
  loadComplete();
};

load();