/**
 * @class Sprite
 * 
 * @param {number} x            Starting X position
 * @param {number} y            Starting Y position
 * @param {TCTexture} texture   Tiny-Canvas Texture object
 * @param {Frame[]} frames Array of arrays of frame position data [x, y, width, height]
 * @param {number} startingFrame Animation frame to start on
 * @param {number}  animSpeed    Game frames per animation frame
 *
 * @return {Sprite}
 */
function Sprite(x, y, texture, frames, startingFrame, animSpeed) {
  /**
   * Canvas X position
   * @inner
   * @type {number}
   */
  this.posX = x

  /**
   * Canvas Y position
   * @type {number}
   */
  this.posY = y

  /**
   * tinyCanvas Texture
   * @type {TCTexture}
   */
  this.texture = texture

  /**
   * Speed on the X plane
   * Left = 0, Right = Canvas Width
   * @type {number}
   */
  this.speedX = 0

  /**
   * Speed on the Y plane.
   * Top = 0, Bottom = Canvas.height
   * @type {number}
   */
  this.speedY = 0

  /**
   * Rotation ?? Radians? Degrees?
   * @type {number}
   */
  this.rotation = 0

  /**
   * Flipped (used for direction)
   * @type {Boolean}
   */
  this.flipped = false

  /**
   * Game frames per animation frame
   * @type {number}
   */
  this.animSpeed = animSpeed

  /**
   * Array of frames
   * @type {Frame[]}
   */
  this.frames = frames

  /**
   * Current animation frame
   * @type {number}
   */
  this.currentFrame = startingFrame

  /**
   * Udpates frame
   * @method updateFrame
   * @param {Frame} newFrame next frame to render
   */
  this.updateFrame = function(newFrame) {
    /**
     * Frame width
     * @type {number}
     */
    this.width = newFrame[2]

    /**
     * Frame Height
     * @type {[type]}
     */
    this.height = newFrame[3]

    /**
     * FrameX / Texture's total width
     * @type {number}
     */
    this.u0 = newFrame[0] / texture.width

    /**
     * FrameY / Texture's total height
     * @type {number}
     */
    this.v0 = newFrame[1] / texture.height

    /**
     * u0 plus (Frame's width / Texture's total Width)
     * @type {number}
     */
    this.u1 = this.u0 + (newFrame[2] / texture.width)

    /**
     * v0 plus (Frame's height / Texture's total height)
     * @type {[type]}
     */
    this.v1 = this.v0 + (newFrame[3] / texture.height)
  }

  /**
   * Forcibly set frame to certain position
   * @method setFrame
   * @param {number} framePos index of frame from this.frames[]
   */
  this.setFrame = function(framePos) {
    if (this.currentFrame === framePos) return
    this.currentFrame = framePos
    this.updateFrame(this.frames[this.currentFrame])
  }

  /**
   * Determines animation and can update frame
   * @method animate
   * @param {number} frameCount Global frame counter
   */
  this.animate = function(frameCount) {
    if (frameCount % this.animSpeed === 0) {
      this.currentFrame = (this.frames.length - 1 === this.currentFrame) ? 0 : ++this.currentFrame
      this.updateFrame(this.frames[this.currentFrame])
    }
  }

  /**
   * Makes canvas draw calls
   * @method _draw
   * @param {TCCanvas} tinyCanvas Instance of tinyCanvass
   */
  this._draw = function(tinyCanvas) {
    tinyCanvas.push()
    tinyCanvas.trans(this.posX, this.posY)
    tinyCanvas.rot(this.rotation)

    // Set horizontal start and endpoints according to flipped status
    var startX = (this.flipped) ? this.u1 : this.u0
    var endX = (this.flipped) ? this.u0 : this.u1

    tinyCanvas.img(
      // texture to render
      this.texture,

      // x origin
      0,

      // y origin
      0,

      // sprite width
      this.width,

      // sprite height
      this.height,

      // no idea
      startX,
      this.v0,
      endX,
      this.v1
    )

    tinyCanvas.pop()
  }


  this.updateFrame(frames[startingFrame])
}

export default Sprite

/**
 * A array consisting of x, y, width, height numbers in pixels
 * @typedef {Array.<number>} Frame
 */
