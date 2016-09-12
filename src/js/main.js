import {TinyCanvas, CreateTexture} from './libs/tiny-canvas'
import MusicController from '../js-old/sound/music-controller'
import FxController from '../js-old/sound/fx-controller'

var music = new MusicController()
var fx = new FxController()

music.playSong1()
fx.playEnemyHit()

/* ===================================================================================================
 NOTES
 =====================================================================================================
 All variables starting with C_ are constants and should never show up in compiled code as is.
 -----------------------------------------------------------------------------------------------------
 We load a single sprite sheet as an image and create a "texture" that is shared by all sprites.
 -----------------------------------------------------------------------------------------------------
 Everything rendered lives in this structure
 Layer > Entity > Sprite Stack > Sprite
 -----------------------------------------------------------------------------------------------------
 Everything is in one file. A few things could be split out but we are taking advantage of globals in
 a number of places that would be costly to move.
 -----------------------------------------------------------------------------------------------------
 There are a lot of functions and top-level variables instead of object properties. This is because
 object property names don't get renamed in minification.
 -----------------------------------------------------------------------------------------------------
 The majority of game logic lives in 3 places:
 - Entity "update" functions
 - Collision handlers
 - game-state loop checks (for things like lose-condition, round management, etc)
 */

// Function shortcuts (since minifier doesn't help with these specific ones):
var addEvtListener = document.addEventListener
var rand = Math.random
var floor = Math.floor
var min = Math.min
var max = Math.max

// Small utility functions
function randInt(min, max) { return floor(rand() * (max - min + 1)) + min }

// The tiniest canvas
var canvas = TinyCanvas(document.getElementById('c'))
var canvasWidth = canvas.c.width
var canvasHeight = canvas.c.height

// Simple frame count (increments on every frame)
var frameCount = 0

// Sprite sheet image+texture that gets loaded
var spriteSheetImage = new Image()
var spriteSheetTexture

// Key state
var keys = {}

// Handle keys events
addEvtListener('keydown', function(e) {
  console.log(e.which + ' key DOWN')
  keys[e.which] = true
})

addEvtListener('keyup', function(e) {
  console.log(e.which + ' key UP')
  keys[e.which] = false
})

// Keyboard controls
var C_KEY_START_GAME = 13 // return
var C_KEY_PAUSE_GAME = 27 // esc
var C_KEY_MOVE_LEFT = 65 // a
var C_KEY_MOVE_RIGHT = 68 // d
var C_KEY_JUMP = 74 // space
var C_KEY_SHOOT = 73 // j
var C_KEY_DASH = 75 // k
var C_KEY_TIMEWARP = 16 // shift

// Rain configuration
var C_RAIN_NUM_DROPS = 200
var C_RAIN_TIME_WARP_FACTOR = 0.2
var C_RAIN_ANGLE = -4

// Hero and World Settings
var C_WORLD_GRAVITY = 0.5
var C_HERO_MAX_WALK_SPEED = 4
var C_MAX_HEALTH = 1000

// UI
var C_UI_HEALTH_BAR_WIDTH = 150
var C_UI_HEALTH_BAR_HEIGHT = 5

// Game status constants
var C_STATUS_MENU     = 0
var C_STATUS_PLAYING  = 1
var C_STATUS_PAUSED   = 2
var C_STATUS_POSTGAME = 3

/**
 * Game Status (state). Keeps track of whether we are at the menu, playing, paused, post-game, etc
 *
 * @type {number}
 */
var gameStatus = C_STATUS_MENU

// Local Storage indexes
var C_LS_HIGH_SCORE = 0

// Other game state
var timewarp = false
var highScore = localStorage[C_LS_HIGH_SCORE] || 0
var score
var health

// Layer "ids"
var C_LAYER_WORLD       = 0
var C_LAYER_ENEMIES     = 1
var C_LAYER_HERO        = 2
var C_LAYER_PROJECTILES = 3
var C_LAYER_FOREGROUND  = 4
var C_LAYER_UI_IN_GAME  = 5
var C_LAYER_UI_IN_MENU  = 6

// "Layers"
var layers = [

  // world
  [],

  // enemies
  [],

  // hero
  [],

  // projectiles
  [],

  // foreground
  [],

  // in-game UI
  [],

  // in-menu UI
  []

]

// TODO: consider removing unused letters
// TODO: consider removing values that are consistent like Y:0 and H:5
var TEXT = {
  '0': [495,5],
  '1': [451,4],
  '2': [455,5],
  '3': [460,5],
  '4': [465,5],
  '5': [470,5],
  '6': [475,5],
  '7': [480,5],
  '8': [485,5],
  '9': [490,5],
  ' ': [500,5],
  a: [315,5],
  b: [320,5],
  c: [325,5],
  d: [330,5],
  e: [335,5],
  f: [340,5],
  g: [345,5],
  h: [350,5],
  i: [356,3],
  j: [358,5],
  k: [363,5],
  l: [368,5],
  n: [373,6],
  m: [379,6],
  o: [385,5],
  p: [390,5],
  q: [395,5],
  r: [400,5],
  s: [405,5],
  t: [410,5],
  u: [415,6],
  v: [421,6],
  w: [427,6],
  x: [433,6],
  y: [439,6],
  z: [445,6]
}

/**
 * Checks if game status is any of the statuses passed as an array
 *
 * @param {number|Array} status Status to check if any match current game status
 *
 * @returns {boolean}
 */
function gameStatusIs(status) {
  return (status === gameStatus || status.indexOf(gameStatus) !== -1)
}

//function colliding(entity1, entity2) {
//
//  return (
//    s1.posX < s2.posX + s2.width &&
//    s1.posX + s1.width > s2.posX &&
//    s1.posY < s2.posY + s2.height &&
//    s1.height + s1.posY > s2.posY
//  )
//
//}

/**
 * Entities need to be able to "destroy" themselves. This creates a function they can store to do so.
 *
 * @param {number} layerIndex
 * @param {number} entityIndex
 *
 * @returns {Function}
 */
function createFunctionToDestroyEntity(layerIndex, entityIndex) {
  return function() {
    layers[layerIndex][entityIndex] = null
  }
}

/**
 * Create an entity (to establish a standard interface)
 *
 * @param {number} layerIndex
 * @param {number} x initial origin position
 * @param {number} y initial origin position
 * @param {number[]} hitboxCoords (relative to origin point)
 * @param {object[]} spriteStack
 * @param {function} updateFunction
 */
function createEntity(layerIndex, x, y, hitboxCoords, spriteStack, updateFunction) {
  var newIndex = layers[layerIndex].length
  layers[layerIndex].push({
    x: x,
    y: y,
    h: hitboxCoords,
    s: spriteStack,
    u: updateFunction,
    d: createFunctionToDestroyEntity(layerIndex, newIndex)
  })
}

function createHero() {
  console.log('createHero() called')

  createEntity(
    C_LAYER_HERO,

    // origin (x, y)
    100,
    100,

    // Hitbox
    [0, 0, 18, 24],

    // Sprite stack
    [
      // Main hero sprite
      {
        // frameset
        fs: [

          // Standing "frameset" (only one frame)
          [[902, 0, 18, 24]],

          // Walking frameset (example)
          [[0, 0, 1, 1], [1, 0, 1, 1], [0, 0, 1, 1]]
        ]
      },

      // TODO, dashing decorator sprite
    ],

    // Update function
    function() {
      if (keys[C_KEY_MOVE_RIGHT]) {
        this.x += C_HERO_MAX_WALK_SPEED
        this.s[0].f = false // flipped => false
      } else if (keys[C_KEY_MOVE_LEFT]) {
        this.x -= C_HERO_MAX_WALK_SPEED
        this.s[0].f = true // flipped => true
      }
    }
  )
}

function createHealthBar() {
  console.log('createHealthBar() called')

  createEntity(
    C_LAYER_UI_IN_GAME,

    // origin (x, y)
    40,
    11,

    // Hitbox
    null,

    // Sprite stack
    [
      // background bar (white)
      {
        xo: -1,
        yo: -1,
        fs: [[[1012, 0, 1, 1]]],
        sx: C_UI_HEALTH_BAR_WIDTH + 2,
        sy: C_UI_HEALTH_BAR_HEIGHT + 2
      },

      // inner health bar (red)
      {
        fs: [[[1011, 0, 1, 1]]],
        sx: C_UI_HEALTH_BAR_WIDTH,
        sy: C_UI_HEALTH_BAR_HEIGHT
      }
    ],

    // Update function
    function() {
      this.s[1].sx = floor((health/C_MAX_HEALTH) * C_UI_HEALTH_BAR_WIDTH)
    }
  )
}

function createRaindrop() {
  console.log('createRaindrop() called')

  var x = (rand() * (canvasWidth + 600)) - 300
  var y =  rand() * canvasHeight
  var xSpeed = -3 + rand() * 3 + 1.5 + C_RAIN_ANGLE
  var ySpeed = randInt(4, 9)
  var length = randInt(4, 16)
  var rotation = Math.atan2(length, xSpeed) + 1.5708

  //

  createEntity(
    C_LAYER_FOREGROUND,

    // origin (x, y)
    x,
    y,

    // Hitbox
    [0, 0, 1, 1],

    // Sprite stack
    [
      // droplet sprite
      {
        // current frame
        c: 0x77E6B48E,
        sy: length,
        r: rotation,
        f: false,
        fs: [[[1012, 0, 1, 1]]]
      }
    ],

    // Update function
    function() {
      this.x += xSpeed * (timewarp ? C_RAIN_TIME_WARP_FACTOR : 1)
      this.y += ySpeed * (timewarp ? C_RAIN_TIME_WARP_FACTOR : 1)

      // If drop is out of range, regenerate it
      // TODO: update
      if (this.y > canvasHeight) {
        this.x = (rand() * (canvasWidth + 600)) - 300
        xSpeed = -3 + rand() * 3 + 1.5 + C_RAIN_ANGLE
        ySpeed = randInt(4, 9)
        rotation = Math.atan2(length, xSpeed) + 1.5708

        this.y = 0
      }
    }
  )
}

function createText(layer, text, x, y, scale) {
  scale = scale || 1
  var runningOffsetX = 0
  var lastWidth = 0;
  createEntity(
    layer,

    // origin
    x, y,

    // hitbox
    [0, 0, 1, 1],

    // sprite stack
    text.toLowerCase()
      .split('')
      .map(function(char) {
        var frame = TEXT[char]
        runningOffsetX += lastWidth * scale
        lastWidth = frame[1]
        return {
          xo: runningOffsetX,
          yo: 0,
          cf: 0,
          sx: scale,
          sy: scale,
          fs: [[[frame[0], 0, frame[1], 5]]]
        }
      }),

    function() {}
  )
}

function updateEntity(entity) {
  if (!entity) {
    return
  }

  entity.u()
}

function drawEntitySprites(entity) {
  if (!entity) {
    return
  }

  // TODO: sprite position should be relative to entity
  // offsets could be an optional property

  // each sprite should have framesets
  // each frameset should have 1+ frames
  // each frameset should have an animation speed?
  // framesets can be named with constants
  // FRAMESET_HERO_STANDING

  // Loop through the sprite stack for the entity and draw each
  entity.s.forEach(function(sprite) {

    //if (frameCount % 3 === 0) {
    //  console.log(entity.x, entity.y)
    //  console.log(sprite.xo, sprite.yo)
    //}

    canvas.push()
    canvas.trans(
      //entity.x + ((sprite.xo || 0) * sprite.sx || 1),
      //entity.y + ((sprite.yo || 0) * sprite.sy || 1)
      entity.x + (sprite.xo || 0),
      entity.y + (sprite.yo || 0)
    )
    canvas.rot(sprite.r || 0)

    // If the sprite has a color, apply it
    if (sprite.c) {
      canvas.col = sprite.c
    }

    if (sprite.sx || sprite.sy) {
      canvas.scale(sprite.sx || 1, sprite.sy || 1)
    }

    //var currentFrame = 0
    //var frame = [902, 0, 18, 24]
    //var frame = [1012, 0, 1, 1]
    var frame = sprite.fs[0][0]
    //if (frameCount % 3 === 0) {
    //  console.log(frame)
    //}
    var x1 = frame[0] / spriteSheetTexture.width
    var x2 = (frame[0] + frame[2]) / spriteSheetTexture.width

    //if (frameCount % 10 === 0) {
    //  console.log([
    //    0,
    //    0,
    //    frame[2],
    //    frame[3], // NOTE: this is where y-scale needs to happen
    //    sprite.f ? x2 : x1,       // sprite location in sheet (draw backwards if "f"/flipped)
    //    frame[1] / spriteSheetTexture.height,
    //    sprite.f ? x1 : x2,
    //    (frame[1] + frame[3]) / spriteSheetTexture.height
    //  ])
    //}

    canvas.img(
      spriteSheetTexture,
      0,
      0,
      frame[2],
      frame[3], // NOTE: this is where y-scale needs to happen
      sprite.f ? x2 : x1,       // sprite location in sheet (draw backwards if "f"/flipped)
      frame[1] / spriteSheetTexture.height,
      sprite.f ? x1 : x2,
      (frame[1] + frame[3]) / spriteSheetTexture.height
    )
    // Reset the color
    canvas.col = 0xFFFFFFFF

    canvas.pop()

  })

}

function startNewGame() {
  console.log('startNewGame() called')

  // Clear the Menu UI layer
  layers[C_LAYER_UI_IN_MENU] = []

  // Set game status...
  gameStatus = C_STATUS_PLAYING

  // Reset all the state

  // Health to 100%
  health = C_MAX_HEALTH

  // Reset score
  score = 0

  // Current round to 0/1

  // etc, etc

  createHero()
  createHealthBar()
  createText(C_LAYER_UI_IN_GAME, 'dont go crazy andy', 90, 90, 2)

  // Temp: Fake dying
  setTimeout(function() { score += 100 }, 1000)
  setTimeout(function() { hurt(50) }, 1000)
  setTimeout(function() { hurt(200) }, 2000)
  setTimeout(function() { hurt(500) }, 3000)
  setTimeout(function() { hurt(10000000) }, 4000)

}

function hurt(damage) {
  console.log('TAKING DAMAGE! ' +  damage)
  health = Math.max(0, health - damage)
  console.log('health => ' + health)

  if (health === 0) {
    lose()
  }
}

function lose() {

  console.log('game over!')

  // Reset per-game layers+entities (chained intentionally)
  layers[C_LAYER_ENEMIES]
    = layers[C_LAYER_HERO]
    = layers[C_LAYER_PROJECTILES]
    = layers[C_LAYER_UI_IN_GAME]
    = []

  // Set game status to post-game screen
  gameStatus = C_STATUS_POSTGAME

  console.log('score', score)

  // Update high score if appropriate
  if (score > highScore) {
    console.log('NEW HIGH SCORE!')
    localStorage[C_LS_HIGH_SCORE] = highScore = score
  }



}

// OMG, code pathz so hot right now
function update() {

  // Check for start new game trigger
  if (gameStatusIs([C_STATUS_MENU, C_STATUS_POSTGAME]) && keys[C_KEY_START_GAME]) {
    startNewGame()
  }

  // Check for pause trigger
  if (keys[C_KEY_PAUSE_GAME]) {
    if (gameStatusIs(C_STATUS_PLAYING)) {
      // TODO: pause game
      console.log('PAUSE!')
    } else if (gameStatusIs(C_STATUS_PAUSED)) {
      // TODO: resume game
      console.log('RESUME!')
    }
  }

  timewarp = !!keys[C_KEY_TIMEWARP]

  layers.forEach(function(group) {
    group.forEach(updateEntity)
  })
}

// Let's draw pretty pictures
function draw() {
  layers.forEach(function(entity) {
    entity.forEach(drawEntitySprites)
  })
}

function loop() {
  requestAnimationFrame(loop)
  update()
  canvas.cls()
  draw()
  canvas.flush()
  frameCount++
}


// ---------------------------------------------------------
// Initialize "app"
// ---------------------------------------------------------

// Load the sprite sheet. Once it's loaded, that's how we know we are ready to rock!
spriteSheetImage.src    = 's.png'
spriteSheetImage.onload = function() {

  // When the image loads, create the sprite sheet texture
  spriteSheetTexture = CreateTexture(canvas.g, spriteSheetImage, spriteSheetImage.width, spriteSheetImage.height)

  // Set the canvas background
  canvas.bkg(0.133, 0.125, 0.204)


  for (var a = 0; a < C_RAIN_NUM_DROPS; a++) {
    createRaindrop()
  }

  // Start loop
  loop()
}
