/**
 * @class An Image based DisplayObject
 * @param {Number} x       Starting X position
 * @param {Number} y       Starting Y position
 * @param {TCTexture} texture Tiny-Canvas Texture object
 * @param {Number[]} frame   Frame position data [x, y, width, height]
 * @return {Sprite}
 */
function Sprite(x, y, texture, frame) {
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

  this.updateFrame(frame);
}

export default Sprite;