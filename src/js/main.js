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

// Stars
var C_STARS_NUM = 200

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
var shooting

// Layer "ids"
var C_LAYER_BACKGROUND  = 0
var C_LAYER_WORLD       = 1
var C_LAYER_ENEMIES     = 2
var C_LAYER_HERO        = 3
var C_LAYER_PROJECTILES = 4
var C_LAYER_FOREGROUND  = 5
var C_LAYER_UI_IN_GAME  = 6
var C_LAYER_UI_IN_MENU  = 7

// "Layers"
var layers = [

  // background
  [],

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
  i: [356,2],
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
  return (status === gameStatus || (typeof status === typeof [] && status.indexOf(gameStatus) !== -1))
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
    xv: 0,
    yv: 0,
    h: hitboxCoords,
    s: spriteStack,
    u: updateFunction,
    d: createFunctionToDestroyEntity(layerIndex, newIndex)
  })
}

function createStars() {

  var ss = []

  for (var i = 0; i < C_STARS_NUM; i++) {
    ss.push({
      c: 0x55FFFFFF,
      xo: randInt(8, canvasWidth - 8),
      yo: randInt(8, canvasHeight - 8),
      fs: [[[1, 0, 1, 1]]]
    })
  }

  createEntity(C_LAYER_BACKGROUND, 0, 0, null, ss, function() {})

}

function createBuildings() {

  var ss = []

  // Two layers
  for (var i = 0; i <= 1; i++) {

    var cursor = -50

    while (cursor < canvasWidth + 50) {

      var widthForBuilding = randInt(20, 30)
      var heightForBuilding = i ? randInt(50, 140) : randInt(150, 250)

      // back layer: #07070a
      // front layer: 151521

      ss.push({
        c: i ? 0xFF211515 : 0xFF0a0707,
        xo: cursor,
        yo: canvasHeight - heightForBuilding,
        fs: [[[1, 0, 1, 1]]],
        sx: widthForBuilding,
        sy: heightForBuilding
      })

      // Move the cursor forward our building's width plus a random amount
      //cursor += widthForBuilding + (rand() > 0.5 ? 0 : randInt(4, 20))
      cursor += widthForBuilding + (i ? 0 : randInt(0, 30))
    }

  }

  createEntity(C_LAYER_BACKGROUND, 0, 0, null, ss, function() {})

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
          [[74, 0, 18, 24]],

          // Walking frameset (example)
          [[0, 0, 1, 1], [1, 0, 1, 1], [0, 0, 1, 1]]
        ]
      },

      // TODO, dashing decorator sprite
    ],

    // Update function
    function() {
      if (keys[C_KEY_MOVE_RIGHT]) {
        this.x = min(canvasWidth - 18, this.x + C_HERO_MAX_WALK_SPEED)
        // Set the direction (unless we are shooting+strafing)
        if (!shooting) {
          this.s[0].f = false // flipped => false
        }
      } else if (keys[C_KEY_MOVE_LEFT]) {
        this.x = max(0, this.x - C_HERO_MAX_WALK_SPEED)
        // Set the direction (unless we are shooting+strafing)
        if (!shooting) {
          this.s[0].f = true // flipped => true
        }
      }

      // gravity via y velocity
      this.yv = (this.y < 266) ? this.yv + C_WORLD_GRAVITY : 0

      this.y += this.yv

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
        fs: [[[1, 0, 1, 1]]],
        sx: C_UI_HEALTH_BAR_WIDTH + 2,
        sy: C_UI_HEALTH_BAR_HEIGHT + 2
      },

      // inner health bar (red)
      {
        fs: [[[0, 0, 1, 1]]],
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
        fs: [[[2, 0, 1, 1]]]
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

/**
 * param layer {number}
 * param text {string}
 * param x {number}
 * param y {number}
 * param scale {number}
 * duration {number}
 * delay {number}
 */
function createText(layer, text, x, y, scale, duration, delay) {
  scale = scale || 1
  var runningOffsetX = 0
  var lastWidth = 0

  /**
   * param t {number} current time
   * param b {number} starting value
   * param c {number} change in value
   * param d {number} duration
   */
  var easeInOutQuint = function (t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b
    return c/2*((t-=2)*t*t*t*t + 2) + b
  }

  var startingY = -10 * scale
  var endY = y

  var animStart = frameCount + (delay || 0)
  var animEnd = animStart + (duration || 1)

  createEntity(
    layer,

    // origin
    x, startingY,

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

    function() {
      if (frameCount < animStart) return
      if (frameCount > animEnd) return
      this.y = floor(easeInOutQuint(frameCount - animStart, startingY, endY - startingY, (duration || 1)))
    }
  )
}

function createMenu() {
  createText(C_LAYER_UI_IN_MENU, 'r0b0ts have become t00 dangerous', 90, 10, 2, 120 ,20)
  createText(C_LAYER_UI_IN_MENU, 't00 powerful', 310, 30, 2, 120, 80)
  createText(C_LAYER_UI_IN_MENU, 't00 sentient', 340, 50, 2, 120, 120)
  createText(C_LAYER_UI_IN_MENU, 'so we we made an even stronger one to wipe them out', 90, 70, 2, 120, 200)
  createText(C_LAYER_UI_IN_MENU, 'ROBO SLAYER 3ooo', 30, 100, 8, 120, 300)
  createText(C_LAYER_UI_IN_MENU, 'press enter to begin', 40, 260, 4, 120, 460)
}

function createPostMenu(score, highScore) {
  createText(C_LAYER_UI_IN_MENU, 'game over', 80, 60, 8, 30 ,0)
  createText(C_LAYER_UI_IN_MENU, 'score', 40, 120, 4, 40 ,80)
  createText(C_LAYER_UI_IN_MENU, score.toString(), 40, 150, 4, 40 ,80)

  createText(C_LAYER_UI_IN_MENU, 'press enter to restart', 440, 220, 2, 40 ,160)

  createText(C_LAYER_UI_IN_MENU, ((score > highScore) ? 'new ' : '') + 'high score', 40, 220, 4, 40 ,100)
  createText(C_LAYER_UI_IN_MENU, highScore.toString(), 40, 250, 4, 40 ,100)

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

    var frame = sprite.fs[0][0]
    var x1 = frame[0] / spriteSheetTexture.width
    var x2 = (frame[0] + frame[2]) / spriteSheetTexture.width

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

  // Clear the background (in case there is one left over from the last game)
  layers[C_LAYER_BACKGROUND] = []

  // Clear the Menu UI layer
  layers[C_LAYER_UI_IN_MENU] = []
  layers[C_LAYER_UI_IN_GAME] = []

  // Set game status...
  gameStatus = C_STATUS_PLAYING

  // Health to 100%
  health = C_MAX_HEALTH

  // Reset score
  score = 0

  // Reset timewarp
  timewarp = false

  // Reset hero state
  shooting = false

  // Current round to 0/1

  // etc, etc

  createStars()
  createBuildings()
  createHero()
  createText(C_LAYER_UI_IN_GAME, 'HEALTH', 7, 11, 1)
  createHealthBar()

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
  timewarp = true

  // Reset per-game layers+entities (chained intentionally)
  layers[C_LAYER_ENEMIES] = []
  layers[C_LAYER_HERO] = []
  layers[C_LAYER_PROJECTILES] = []
  layers[C_LAYER_UI_IN_GAME] = []

  // Set game status to post-game screen
  gameStatus = C_STATUS_POSTGAME

  console.log('score', score)

  createPostMenu(score, highScore)

  // Update high score if appropriate
  if (score > highScore) {
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

  // TODO: make sure certain checks/updates only run during GAME_ACTIVE_STATUS

  // Updates that should only happen in game:
  if (gameStatusIs(C_STATUS_PLAYING)) {

    // Check for shooting
    // TODO: add multiple weapon types?
    if (keys[C_KEY_SHOOT]) {
      if (!shooting) {
        //var startX = self.sprite.posX + ((self.lastXDirection === 'l') ? 0 : 8)
        //spawnBullet(startX, self.sprite.posY + randInt(9, 11), self.lastXDirection)
        console.log('Spawn bullet!')
        fx.playShoot()
        shooting = true
      }
    } else {
      shooting = false
    }

    // Check for timewarp
    timewarp = !!keys[C_KEY_TIMEWARP]
  }

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
    createMenu()
  }

  // Start loop
  loop()
}
