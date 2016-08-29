import Sprite from '../graphics/sprite'
import CONFIG from '../config/config'

export default function Player(texture) {

  var self = this

  // Initial state
  var lastXDirection = 'r' // can be "l" or "r"; important for strafing while facing up
  var facingUp = false
  var walking = false
  var speedX = 0
  var speedY = 0
  var jumping = false
  var doubleJumpReady = false
  var doubleJumpUsed = true // This starts as true since we spawn the player in the air
  var onGround = false // this starts as false since we spawn the player in the air
  var jumpFramesLeft = 0

  // origin, speed, frames, startingFrame, animSpeed

  self.sprite = new Sprite(100, 100, texture, [
    [0, 0, 16, 20],
    [16, 0, 16, 20],
    [32, 0, 16, 20],
    [48, 0, 16, 20],
    [64, 0, 16, 20]
  ], 1, 4)

  self.update = function(app, scene) {

    // If the player is holding the "up" key (w), they are "facing up" (for shooting upwards)
    facingUp = (app.keys[CONFIG.KEY.FACE_UP])

    // If the player is on the ground and pressing left or right they are "walking" / strafing
    walking = (onGround && (app.keys[CONFIG.KEY.MOVE_LEFT] || app.keys[CONFIG.KEY.MOVE_RIGHT]))

    if (app.keys[CONFIG.KEY.MOVE_LEFT]) {
      lastXDirection = 'l'
      self.sprite.flipped = true

      // If the player is going the opposite direction, stop them, so they can flip around immediately (game feel)
      if (speedX > 0) {
        speedX = 0
      }

      speedX = Math.max(speedX - CONFIG.MOVEMENT.WALK_SPEED, -CONFIG.MOVEMENT.WALK_SPEED_MAX)

    } else if (app.keys[CONFIG.KEY.MOVE_RIGHT]) {
      lastXDirection = 'r'
      self.sprite.flipped = false

      // If the player is going the opposite direction, stop them, so they can flip around immediately (game feel)
      if (speedX < 0) {
        speedX = 0
      }

      speedX = Math.min(speedX + CONFIG.MOVEMENT.WALK_SPEED, CONFIG.MOVEMENT.WALK_SPEED_MAX)

    } else {

      // If on the ground and not holding left or right, set speed to 0
      speedX = 0

      //// TODO: add if on ground, speed *= 0.8
      //if (Math.abs(speedX) < 1) {
      //  speedX = 0
      //} else {
      //  speedX *= 0.95
      //}

    }

    // Jumping controls
    if (app.keys[CONFIG.KEY.JUMP]) {

      // If user is already jumping, check if the have a 2nd jump available, if so double jump!
      if (jumping && !doubleJumpUsed && doubleJumpReady) {
        jumpFramesLeft = CONFIG.MOVEMENT.JUMP_LENGTH
        doubleJumpUsed = true
        doubleJumpReady = false

      } else if (!jumping) {

        // If not already jumping, jump!
        onGround = false
        jumping = true
        jumpFramesLeft = CONFIG.MOVEMENT.JUMP_LENGTH

      }

    } else {

      // If the user is jumping but hasn't jumped a 2nd time,
      // they can now press the jump key again to use their 2nd jump
      if (jumping && !doubleJumpUsed) {
        doubleJumpReady = true
      }

    }

    // Jumping movement
    if (jumping && jumpFramesLeft > 0) {
      // TODO: consider deceleration for jump speed
      speedY = -CONFIG.MOVEMENT.JUMP_SPEED
      jumpFramesLeft--

    } else if (!onGround) {

      // If the player is not jumping and not on the ground, increase their speed towards the ground with "gravity"
      // NOTE: explicitly not limiting the speed (no terminal velocity) since for our game size we can keep it simple
      speedY += CONFIG.WORLD.GRAVITY

    }

    // NOTE: world interactions / bounds / clamping happens here in a manual way
    // This works independently of normal collisions

    // Check if in the range of the platforms (horizontally)
    // NOTE: the + 16 is accounting for the sprite width
    var inRangeOfPlatform1 = (self.sprite.posX + 16 >= 100 && self.sprite.posX <= 232)
    var inRangeOfPlatform2 = (self.sprite.posX + 16 >= 468 && self.sprite.posX <= 600)

    // If so...
    if (inRangeOfPlatform1 || inRangeOfPlatform2) {

      if (self.sprite.posY < 180 + 20 && speedY > 0 && (self.sprite.posY + speedY >= 180)) {

        // If above the platform, moving downward, and past the platform, limit to platform top (and mark as on ground)
        self.sprite.posY = 180
        onGround = true

      } else if (self.sprite.posY > 189 && speedY < 0 && (self.sprite.posY + speedY <= 205)) {

        // If below the platform and moving upward, limit movement upwards to bottom of platform
        self.sprite.posY = 205

        // If we hit the bottom of a platform, cancel the current jump
        jumpFramesLeft = 0
        speedY = 0

       } else {
        // Otherwise, apply the speed as normal
        self.sprite.posY += speedY
      }



    } else {

      // Otherwise, apply the speed as normal
      self.sprite.posY += speedY

    }




    // Apply the horizontal movement (but limit to canvas width)
    self.sprite.posX = Math.max(Math.min(self.sprite.posX + speedX, 700 - 16), 0)

    // In case we need it: limit player to top of the canvas
    //self.sprite.posY = Math.max(self.sprite.posY, 0)

    // Handle the bounds for the ground
    if (self.sprite.posY >= 263) {
      self.sprite.posY = 263
      onGround = true
    }

    // If the player is on the ground, reset the jumping state
    if (onGround) {
      jumping = false
      doubleJumpUsed = false
      doubleJumpReady = false
    }

  }

  self.draw = function(app) {

    if (walking) {
      // TODO: animate sprite for walking?
    }

    self.sprite._draw(app.canvas)

  }

}
