import Sprite from '../graphics/sprite'
import CONFIG from '../config/config'

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function Player(texture) {

  var self = this

  // Initial state
  self.lastXDirection = 'r' // can be "l" or "r"; important for strafing while facing up
  var facingUp = false
  var walking = false
  self.dashing = false
  var shooting = false
  var speedX = 0
  var speedY = 0
  var jumping = false
  var doubleJumpReady = false
  var doubleJumpUsed = true // This starts as true since we spawn the player in the air
  var onGround = false // this starts as false since we spawn the player in the air
  var onWall = false // Not used yet, but intention is to use to select wall-sliding sprite frame
  var jumpFramesLeft = 0

  // origin, speed, frames, startingFrame, animSpeed

  self.sprite = new Sprite(100, 100, texture, [
    [0, 0, 18, 24],
    [18, 0, 18, 24],
    [36, 0, 18, 24],
    [54, 0, 18, 24],
    [72, 0, 18, 24]
  ], 0, 4)

  self.update = function(app, scene) {

    // If the player is holding the "up" key (w), they are "facing up" (for shooting upwards)
    facingUp = (app.keys[CONFIG.KEY.FACE_UP])

    // If the player is on the ground and pressing left or right they are "walking" / strafing
    walking = (onGround && (app.keys[CONFIG.KEY.MOVE_LEFT] || app.keys[CONFIG.KEY.MOVE_RIGHT]))

    if (walking) {
      self.sprite.animate(app.frameCount)
    } else {
      self.sprite.setFrame(0)
    }

    // Dashing
    if (app.keys[CONFIG.KEY.DASH]) {
      // TODO: drain from special bar

      if (!self.dashing) {
        self.dashing = true
        app.sound.fx.playDashSound()
      }

    } else {
      self.dashing = false
    }

    if (app.keys[CONFIG.KEY.MOVE_LEFT]) {
      self.lastXDirection = 'l'
      self.sprite.flipped = true

      // If the player is going the opposite direction, stop them, so they can flip around immediately (game feel)
      if (speedX > 0) {
        speedX = 0
      }

      if (self.dashing) {
        speedX = -CONFIG.PLAYER.DASH_SPEED
      } else {
        speedX = Math.max(speedX - CONFIG.PLAYER.WALK_SPEED, -CONFIG.PLAYER.WALK_SPEED_MAX)
      }

    } else if (app.keys[CONFIG.KEY.MOVE_RIGHT]) {
      self.lastXDirection = 'r'
      self.sprite.flipped = false

      // If the player is going the opposite direction, stop them, so they can flip around immediately (game feel)
      if (speedX < 0) {
        speedX = 0
      }

      if (self.dashing) {
        speedX = CONFIG.PLAYER.DASH_SPEED
      } else {
        speedX = Math.min(speedX + CONFIG.PLAYER.WALK_SPEED, CONFIG.PLAYER.WALK_SPEED_MAX)
      }

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
        jumpFramesLeft  = CONFIG.PLAYER.JUMP_LENGTH
        doubleJumpUsed  = true
        doubleJumpReady = false
        app.sound.fx.playJumpSound()

      } else if (!jumping) {

        // If not already jumping, jump!
        onGround       = false
        jumping        = true
        jumpFramesLeft = CONFIG.PLAYER.JUMP_LENGTH
        app.sound.fx.playJumpSound()

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
      speedY = -CONFIG.PLAYER.JUMP_SPEED
      jumpFramesLeft--

    } else if (!onGround) {

      // If the player is not jumping and not on the ground, increase their speed towards the ground with "gravity"
      // NOTE: explicitly not limiting the speed (no terminal velocity) since for our game size we can keep it simple
      speedY += CONFIG.WORLD.GRAVITY

      // Optional: allow wall stickiness
      if (self.sprite.posX === 0 || self.sprite.posX === 700 - 18) {
        onWall = true
        speedY = Math.min(speedY, CONFIG.PLAYER.WALL_FALL_SPEED)
      }

    }

    // If the played is not touching the wall or on the ground, they are no longer wall sliding
    if ((self.sprite.posX !== 0 && self.sprite.posX !== 700 - 18) || onGround) {
      onWall = false
    }

    // NOTE: world interactions / bounds / clamping happens here in a manual way
    // This works independently of normal collisions

    // Check if in the range of the platforms (horizontally)
    // NOTE: the + 18 is accounting for the sprite width
    var inRangeOfPlatform1 = (self.sprite.posX + 18 >= 100 && self.sprite.posX <= 232)
    var inRangeOfPlatform2 = (self.sprite.posX + 18 >= 468 && self.sprite.posX <= 600)

    // If so...
    if (inRangeOfPlatform1 || inRangeOfPlatform2) {

      if (self.sprite.posY < 180 + 24 && speedY > 0 && (self.sprite.posY + speedY >= 180)) {

        // If above the platform, moving downward, and past the platform, limit to platform top (and mark as on ground)
        self.sprite.posY = 176
        onGround         = true

      } else if (self.sprite.posY > 189 && speedY < 0 && (self.sprite.posY + speedY <= 205)) {

        // If below the platform and moving upward, limit movement upwards to bottom of platform
        self.sprite.posY = 205

        // If we hit the bottom of a platform, cancel the current jump
        jumpFramesLeft = 0
        speedY         = 0

      } else {
        // Otherwise, apply the speed as normal
        self.sprite.posY += speedY
      }


    } else {

      // Otherwise, apply the speed as normal
      self.sprite.posY += speedY

    }


    // Apply the horizontal movement (but limit to canvas width)
    self.sprite.posX = Math.max(Math.min(self.sprite.posX + speedX, 700 - 18), 0)

    // In case we need it: limit player to top of the canvas
    //self.sprite.posY = Math.max(self.sprite.posY, 0)

    // Handle the bounds for the ground
    if (self.sprite.posY >= 283 - 24) {
      self.sprite.posY = 283 - 24
      onGround         = true
    }

    // If the player is on the ground, reset the jumping state
    if (onGround) {
      jumping         = false
      doubleJumpUsed  = false
      doubleJumpReady = false
    }

    if (app.keys[CONFIG.KEY.SHOOT]) {
      if (!shooting) {
        var startX = self.sprite.posX + ((self.lastXDirection === 'l') ? 0 : 8)
        scene.spawnBullet(startX, self.sprite.posY + randInt(9, 11), self.lastXDirection)
        app.sound.fx.playShoot()
        shooting = true
      }
    } else {
      shooting = false
    }
  }

  self.draw = function(app) {

    if (walking) {
      // TODO: animate sprite for walking?
    }

    self.sprite._draw(app.canvas)

  }

}
