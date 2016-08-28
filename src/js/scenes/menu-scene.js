import Sprite from '../graphics/sprite'

export default function MenuScene(app) {

  var self = this

  var PlayerImage = new Image()
  var PlayerTexture = null
  var EnemyImage = new Image()
  var EnemyTexture = null

  // load
  self.load = function() {

    return Promise.all([
      new Promise(function(resolve) {
        PlayerImage.src    = 'person_cut_tiny.png'
        PlayerImage.onload = function() {
          PlayerTexture = TCTex(app.canvas.g, PlayerImage, PlayerImage.width, PlayerImage.height)
          resolve()
        }
      }),
      new Promise(function(resolve) {
        EnemyImage.src = 'enemy1.png'
        EnemyImage.onload = function() {
          EnemyTexture = TCTex(app.canvas.g, EnemyImage, EnemyImage.width, EnemyImage.height)
          resolve()
        }
      })
    ]).catch(function(err) { console.error(err) })
  }

  var playerSp

  self.create = function() {
    console.log('creating scene')
    playerSp = new Sprite(100, 100, PlayerTexture, [
      [0, 0, 16, 20],
      [16, 0, 16, 20],
      [32, 0, 16, 20],
      [48, 0, 16, 20],
      [64, 0, 16, 20]
    ], 1, 4)

    app.canvas.bkg(0.227, 0.227, 0.227)
  }

  // create
  // update
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
