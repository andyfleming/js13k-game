import {TinyCanvas, CreateTexture} from './libs/tiny-canvas'

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
 */

// Function shortcuts (since minifier doesn't help with these specific ones):
var addEvtListener = document.addEventListener
var rand = Math.random
var floor = Math.floor

// Small utility functions
function randInt(min, max) { return floor(rand() * (max - min + 1)) + min }

// The tiniest canvas
var canvas = TinyCanvas(document.getElementById('c'))

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
var GAME_STATUS = C_STATUS_MENU

// Layer "ids"
var C_LAYER_WORLD       = 0
var C_LAYER_ENEMIES     = 1
var C_LAYER_HERO        = 2
var C_LAYER_PROJECTILES = 3
var C_LAYER_FOREGROUND  = 4
var C_LAYER_UI          = 5

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

  // UI
  []

]

/**
 * Checks if game status is any of the statuses passed as an array
 *
 * @param {number|Array} status Status to check if any match current game status
 *
 * @returns {boolean}
 */
function gameStatusIs(status) {
  return (status === GAME_STATUS || status.indexOf(GAME_STATUS) !== -1)
}

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
 * @param {Array} hitboxCoords
 * @param {Array} spriteStack
 * @param {function} updateFunction
 */
function createEntity(layerIndex, hitboxCoords, spriteStack, updateFunction) {
  var newIndex = layers[layerIndex].length
  layers[layerIndex].push({
    h: hitboxCoords,
    s: spriteStack,
    u: updateFunction,
    d: createFunctionToDestroyEntity(layerIndex, newIndex)
  })
}

function createHero() {
  createEntity(
    C_LAYER_HERO,
    [0, 0, 16, 20],
    [
      []
    ],
    function() {

    }
  )
}

function updateEntity(entity) {
  if (!entity) {
    return
  }
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

    canvas.push()
    canvas.trans(sprite.x, sprite.y)
    canvas.rot(sprite.r)

    // If the sprite has a color, apply it
    if (sprite.c) {
      canvas.col = sprite.c
    }

    var currentFrame = 0
    var frame = [0, 0, 16, 16]
    var x1 = frame[0] / spriteSheetTexture.width
    var x2 = (frame[0] + frame[2]) / spriteSheetTexture.width

    canvas.img(
      spriteSheetTexture,
      entity.x + sprite.xo,
      entity.y + sprite.yo,
      frame[2],
      frame[3],
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

function update() {
  layers.forEach(function(group) {
    group.forEach(updateEntity)
  })
}

function draw() {
  layers.forEach(function(group) {
    group.forEach(drawEntitySprites)
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

  // Create Hero
  createHero()

  // Start loop
  loop()
}
