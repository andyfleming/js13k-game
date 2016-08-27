/* global TC, TCTex */

import './libs/tiny-canvas.js'

import Sprite from './graphics/sprite'
import Enemy from './entities/enemy'
import Group from './entities/group'
import keyboard from './controls/keyboard'
import CONFIG from './config/config'


/**
 * Track keyboard key state in an object
 */
var key = keyboard()

/**
 * Tiny-Canvas Canvas
 * @type {TCCanvas}
 */
var CANVAS = TC(document.getElementById('c'))

/**
 * Tint-Canvas
 * @type {TCGLContext}
 */
var GL = CANVAS.g

/**
 * Store the player state in an object
 *
 * @todo Consider improving name of this and/or sprite object "Player"
 */
var player = {

  /**
   * is player touching the ground
   *
   * @type {Boolean}
   */
  onGround: true,

  /**
   * Set jumps available to the default max
   */
  jumpsLeft: CONFIG.MOVEMENT.JUMPS_ALLOWED

}

/**
 * Number of images whose load has completed
 * @type {Number}
 */
var IMAGES_LOADED = 0

/**
 * Total Number of images expected to load
 * @type {Number}
 */
var TOTAL_IMAGES = 2


/**
 * Player Sprite object
 * @type {Sprite}
 */
var Player = {}

/**
 * Player .png
 * @type {Image}
 */
var PlayerImage = new Image()

/**
 * Player image as Tiny-Canvas Texture
 * @type {TCTexture}
 */
var PlayerTexture = null

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
]

var EnemyGroup = {}
var EnemyImage = new Image()
var EnemyTexture = null
var EnemyFrames = [
  [0, 0, 16, 20],
  [16, 0, 16, 20],
  [32, 0, 16, 20],
  [48, 0, 16, 20]
]


/**
 * Proxy func for Math.random
 * @type {Function}
 * @returns {Number} Between 0 & 1
 */
var rand = Math.random

/**
 * Canvas Width (256)
 * @type {Number}
 */
var MAX_X = CANVAS.c.width

/**
 * Canvas X Origin
 * @type {Number}
 */
var MIN_X = 0

/**
 * Canvas Height (256)
 * @type {Number}
 */
var MAX_Y = CANVAS.c.height

/**
 * Canvas Y Origin
 * @type {Number}
 */
var MIN_Y = 0

var currentFrame         = 0
var GLOBAL_FRAME_COUNTER = 0


/**
 * Sets source on all images to start loading
 */
function load() {
  PlayerImage.src = 'person_cut_tiny.png'
  EnemyImage.src = 'enemy1.png'
}

/**
 * Fired on every load, will call create once last image has loaded
 */
function loadComplete() {
  if (IMAGES_LOADED !== TOTAL_IMAGES) return
  create()
}

/**
 * Creates all sprites
 */
function create() {
  Player = new Sprite(20, 0, PlayerTexture, PlayerFrames, currentFrame, 4)

  EnemyGroup = new Group(Enemy, EnemyTexture, EnemyFrames, 3, {
    origin: [0, 0],
    speed: [
      (Player.direction === 'r') ? rand() * 10 : rand() * -10,
      ((rand() * 10) - 5)
    ]
  })

  EnemyGroup.create(2)

  CANVAS.bkg(0.227, 0.227, 0.227)

  mainLoop()
}


/**
 * MAIN LOOP UPDATE
 * very hot code path, try not to make many function calls
 * only read and set values if at all possible
 */
function update() {
  var ENEMY_TIME = 1
  GLOBAL_FRAME_COUNTER++

  if (key[CONFIG.KEY.TIMEWARP]) { ENEMY_TIME = 0.1 }

  EnemyGroup.update(ENEMY_TIME, {
    MIN_X: MIN_X,
    MIN_Y: MIN_Y,
    MAX_X: MAX_X,
    MAX_Y: MAX_Y,
    GRAVITY: CONFIG.WORLD.GRAVITY
  })

  if (key[CONFIG.KEY.DEV_K]) {
    EnemyGroup.origin = [Player.posX, Player.posY - 15]
    EnemyGroup.speed = [
      (Player.direction === 'r') ? rand() * 10 : rand() * -10,
      ((rand() * 10) - 5)
    ]
    EnemyGroup.create(1)
  }
  /**
   * HANDLE KEY PRESSES
   * update player speeds by preset speeds
   */
  if (key[CONFIG.KEY.MOVE_LEFT]) {
    Player.direction = 'l'
    Player.speedX    = Math.max(Player.speedX - CONFIG.MOVEMENT.WALK_SPEED, -CONFIG.MOVEMENT.WALK_SPEED_MAX)
  }

  if (key[CONFIG.KEY.MOVE_RIGHT]) {
    Player.direction = 'r'
    Player.speedX    = Math.min(Player.speedX + CONFIG.MOVEMENT.WALK_SPEED, CONFIG.MOVEMENT.WALK_SPEED_MAX)
  }

  if (player.onGround && (key[CONFIG.KEY.MOVE_RIGHT] || key[CONFIG.KEY.MOVE_LEFT])) {
    Player.animate(GLOBAL_FRAME_COUNTER)
  } else if (player.onGround) {
    Player.setFrame(4)
  } else {
    Player.setFrame(0)
  }

  if (key[CONFIG.KEY.JUMP] && player.onGround) {
    Player.speedY   = -CONFIG.MOVEMENT.JUMP_SPEED
    player.onGround = false
    player.jumpsLeft -= 1
  }

  if (key[CONFIG.KEY.JUMP] && !player.onGround && player.jumpsLeft > 0 && Player.speedY > -5) {
    Player.speedY   = -CONFIG.MOVEMENT.JUMP_SPEED
    player.onGround = false
    player.jumpsLeft -= 1
  }

  /**
   * Update player to new position
   */
  Player.posX += Player.speedX
  Player.posY += Player.speedY

  /**
   * Update Player gravity
   */
  Player.speedY += CONFIG.WORLD.GRAVITY

  /**
   * Apply friction to player if they're walking
   */
  if (Math.abs(Player.speedX) < 1) {
    Player.speedX = 0
  } else if (player.onGround) {
    Player.speedX *= 0.8
  } else {
    Player.speedX *= 0.95
  }

  /**
   * Clamp Player to Canvas
   */
  if (Player.posY + Player.height >= MAX_Y) {
    Player.posY      = MAX_Y - Player.height
    Player.speedY    = 0
    player.onGround  = true
    player.jumpsLeft = CONFIG.MOVEMENT.JUMPS_ALLOWED
  } else if (Player.posY < MIN_Y) {
    Player.posY = MIN_Y
  }

  if (Player.posX > MAX_X) {
    Player.speedX *= -1
    Player.posX = MAX_X
  } else if (Player.posX < MIN_X) {
    Player.speedX *= -1
    Player.posX = MIN_X
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
  CANVAS.cls()

  // TODO: Push player and other sprites into an array or a coulpe arrays
  // and call _update and _draw on all objects
  // EnemyGroup._draw(CANVAS)
  EnemyGroup.draw(CANVAS)

  Player._draw(CANVAS)
  CANVAS.flush()
}

/**
 * MAIN GAME LOOP
 */
function mainLoop() {
  requestAnimationFrame(mainLoop)
  update()
  draw()
}

/**
 * Callback for image load
 */
PlayerImage.onload = function() {
  PlayerTexture = TCTex(GL, PlayerImage, PlayerImage.width, PlayerImage.height)
  IMAGES_LOADED += 1
  loadComplete()
}

EnemyImage.onload = function() {
  EnemyTexture = TCTex(GL, EnemyImage, EnemyImage.width, EnemyImage.height)
  IMAGES_LOADED += 1
  loadComplete()
}

load()
