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
      speedY += CONFIG.WORLD.GRAVITY
    }

    self.sprite.posX += speedX
    self.sprite.posY += speedY

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
