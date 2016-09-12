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

// Other game state
var timewarp = false
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
  ' ': [72,5,5,5],
  a: [72,0,5,5],
  b: [77,0,5,5],
  c: [82,0,5,5],
  d: [87,0,5,5],
  e: [92,0,5,5],
  f: [97,0,5,5],
  g: [102,0,5,5],
  h: [107,0,5,5],
  i: [198, 0, 3, 5],
  j: [112,0,5,5],
  k: [117,0,5,5],
  l: [122,0,5,5],
  m: [186, 0, 6, 5],
  n: [180, 0, 6, 5],
  o: [127,0,5,5],
  p: [132,0,5,5],
  q: [137,0,5,5],
  r: [142,0,5,5],
  s: [147,0,5,5],
  t: [152,0,5,5],
  u: [157,0,5,5],
  v: [162, 0, 6, 5],
  w: [168, 0, 6, 5],
  x: [174, 0, 6, 5],
  y: [192, 0, 6, 5],
  z: [192, 0, 6, 5],
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

var EXAMPLE_SPRITE = {

  // X offset - should this be on the framesets?
  xo: 0,

  // Y offset
  yo: 0,

  w: 10,
  h: 10,

  // Optional: color
  c: 0xFF00FF00,

  // Framesets
  fs: [
    [/* x */ 0, /* y */ 0, /* w */ 10, /* h */ 10, /* animation speed (optional) */ 1,]
  ]

}


// This is an example that doesn't get compiled in, but is just here to document an interface
var EXAMPLE_ENTITY = {

  // hitbox: [x1, y1, x2, y2]
  // hitbox changes independently of sprites
  // hitbox is relative to sprite
  // If the origin is center, it could be something like:
  // [-100, -100, 100, 100]
  hb: [0, 0, 200, 200],

  // sprite stack
  s: [],

  f: false, // flipped (bool)

  update: function() {}

  // proposed: action stack - used for things like falling
  //as: []

  //d: destroyFunction

}

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
 * @param {number[] hitboxCoords (relative to origin point)
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
      .map(function (letter) {
        runningOffsetX += lastWidth * scale
        lastWidth = TEXT[letter][2]
        return {
          xo: runningOffsetX,
          yo: 0,
          cf: 0,
          sx: scale,
          sy: scale,
          fs: [[TEXT[letter]]]
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

  // Reset per-game layers+entities (chained intentionally)
  layers[C_LAYER_ENEMIES]
    = layers[C_LAYER_HERO]
    = layers[C_LAYER_PROJECTILES]
    = layers[C_LAYER_UI_IN_GAME]
    = []

  console.log('game over!')
  console.log('score', score)
}

// OMG, code pathz so hot right now
function update() {

  if (gameStatusIs([C_STATUS_MENU, C_STATUS_POSTGAME]) && keys[C_KEY_START_GAME]) {
    startNewGame()
  }

  if (keys[C_KEY_PAUSE_GAME]) {
    if (gameStatusIs(C_STATUS_PLAYING)) {
      // TODO: pause game
    } else if (gameStatusIs(C_STATUS_PAUSED)) {
      // TODO: resume game
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
