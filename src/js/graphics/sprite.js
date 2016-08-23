/**
 * @class An Image based DisplayObject
 * @param {Number} x            Starting X position
 * @param {Number} y            Starting Y position
 * @param {TCTexture} texture   Tiny-Canvas Texture object
 * @param {Array[]} frames      Array of arrays of frame position data [x, y, width, height]
 * @param {Number} startingFrame Animation frame to start on
 * @param {Number}  animSpeed    Game frames per animation frame
 * @return {Sprite}
 */
function Sprite(x, y, texture, frames, startingFrame, animSpeed   ) {
  /**
   * Canvas X position
   * @type {Number}
   */
  this.posX = x;

  /**
   * Canvas Y position
   * @type {Number}
   */
  this.posY = y;

  /**
   * tinyCanvas Texture
   * @type {TCTexture}
   */
  this.texture = texture;

  /**
   * Speed on the X plane
   * Left = 0, Right = Canvas Width
   * @type {Number}
   */
  this.speedX = 0;

  /**
   * Speed on the Y plane.
   * Top = 0, Bottom = Canvas.height
   * @type {Number}
   */
  this.speedY = 0;

  /**
   * Rotation ?? Radians? Degrees?
   * @type {Number}
   */
  this.rotation = 0;

  /**
   * Direction, either 'l' or 'r'
   * @type {String}
   */
  this.direction = 'r';

  /**
   * Game frames per animation frame
   * @type {Number}
   */
  this.animSpeed = animSpeed

  /**
   * Array of frames
   * @type {Array}
   */
  this.frames = frames;

  /**
   * Current animation frame
   * @type {Number}
   */
  this.currentFrame = startingFrame;

  /**
   * Udpates frame
   * @param  {Frame} newFrame frame
   */
  this.updateFrame = function (newFrame) {
    /**
     * Frame width
     * @type {Number}
     */
    this.width = newFrame[2];

    /**
     * Frame Height
     * @type {[type]}
     */
    this.height = newFrame[3];

    /**
     * FrameX / Texture's total width;
     * @type {Number}
     */
    this.u0 = newFrame[0] / texture.width;

    /**
     * FrameY / Texture's total height
     * @type {Number}
     */
    this.v0 = newFrame[1] / texture.height;

    /**
     * u0 plus (Frame's width / Texture's total Width)
     * @type {Number}
     */
    this.u1 = this.u0 + (newFrame[2] / texture.width);

    /**
     * v0 plus (Frame's height / Texture's total height)
     * @type {[type]}
     */
    this.v1 = this.v0 + (newFrame[3] / texture.height);

    /**
     * Half of the Frame's width
     * @type {Number}
     */
    this.halfWidth = newFrame[2] / 2;

    /**
     * Half of the Frame's height
     * @type {Number}
     */
    this.halfHeight = newFrame[3] / 2;
  };

  /**
   * Forcibly set frame to certain position
   * @param {Number} framePos index of frame from this.frames[]
   */
  this.setFrame = function (framePos) {
    if (this.currentFrame === framePos) return;
    this.currentFrame = framePos;
    this.updateFrame(this.frames[this.currentFrame]);
  }

  /**
   * Determines animation and can update frame
   * @param {Number} frameCount Global frame counter
   */
  this.animate = function (frameCount) {
    if (frameCount % this.animSpeed === 0) {
      this.currentFrame = (this.frames.length - 1 === this.currentFrame) ? 0 : ++this.currentFrame;
      this.updateFrame(this.frames[this.currentFrame]);
    }
  };

  /**
   * Makes canvas draw calls
   * @param {TCCanvas} tinyCanvas Instance of tinyCanvass
   */
  this._draw = function (tinyCanvas) {
    tinyCanvas.push();
    tinyCanvas.trans(this.posX, this.posY);
    tinyCanvas.rot(this.rotation);

    if (this.direction === 'l') tinyCanvas.scale(-1, 1);
    else tinyCanvas.scale(1, 1);

    tinyCanvas.img(
      // texture to render
      this.texture,

      // x origin
      -this.halfWidth,

      // y origin
      0,

      // sprite width
      this.width,

      // sprite height
      this.height,

      // no idea
      this.u0,
      this.v0,
      this.u1,
      this.v1
    );

    tinyCanvas.pop();
  };


  this.updateFrame(frames[startingFrame]);
}

export default Sprite;
