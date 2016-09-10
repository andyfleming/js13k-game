import {TinyCanvas, CreateTexture} from './libs/tiny-canvas'

var canvas = TinyCanvas(document.getElementById('c'))
var frameCount = 0


// Entity Group Layer "ids"
var EGL_WORLD = 0
var EGL_ENEMIES = 1
var EGL_HERO = 2
var EGL_PROJECTILES = 3
var EGL_FOREGROUND = 4
var entityGroups = [

  // world
  [],

  // enemies
  [],

  // hero
  [],

  // projectiles
  [],

  // foreground
  []

]

var spriteSheetImage = new Image()
var spriteSheetTexture


// This is an example that doesn't get compiled in, but is just here to document an interface
var ENTITY_EXAMPLE = {

  // hitbox: [x1, y1, x2, y2]
  hb: [0, 0, 200, 200],

  // sprite stack
  ss: [],

  update: function() {}

  // proposed: action stack - used for things like falling
  //as: []

}

function updateEntity(entity) {

}

function drawEntitySprites(entity) {

}

function update() {
  entityGroups.forEach(function(group) {
    group.forEach(updateEntity)
  })
}

function draw() {
  entityGroups.forEach(function(group) {
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

spriteSheetImage.src    = 'images/sheet.png'
spriteSheetImage.onload = function() {
  spriteSheetTexture = CreateTexture(canvas.g, spriteSheetImage, spriteSheetImage.width, spriteSheetImage.height)

  // Setup
  canvas.bkg(0.133, 0.125, 0.204)

  // Start loop
  loop()
}
