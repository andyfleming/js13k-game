import Sprite from '../graphics/sprite'
import loadImage from '../graphics/load-image'

export default function MenuScene(app) {

  var self = this

  var playerImage = new Image()
  var playerTexture = null
  var enemyImage = new Image()
  var enemyTexture = null

  // load
  self.load = function() {
    return Promise.all([
      loadImage(app, 'hero.tiny.png', playerImage).then(function(t) { playerTexture = t }),
      loadImage(app, 'enemy1.png', enemyImage).then(function(t) { enemyTexture = t }),
    ])
  }

  var playerSp

  self.create = function() {
    console.log('creating scene')
    playerSp = new Sprite(100, 100, playerTexture, [
      [0, 0, 16, 20],
      [16, 0, 16, 20],
      [32, 0, 16, 20],
      [48, 0, 16, 20],
      [64, 0, 16, 20]
    ], 1, 4)

    app.canvas.bkg(0.227, 0.227, 0.227)
  }

  self.update = function() {
    //console.log('updating menu scene')
    if (app.keys[13]) {
      console.log('key found; should go to scene "game"')
      app.goToScene('game')
      return
    }
  }

  // draw
  self.draw = function() {
    //console.log('drawing menu scene')
    playerSp._draw(app.canvas)
  }

}
