import Sprite from '../graphics/sprite'
import Player from '../entities/player'

export default function GameScene(app) {

  var self = this

  // entities
  var player

  // Images and textures
  var PlayerImage = new Image()
  var playerTexture = null
  var EnemyImage = new Image()
  var EnemyTexture = null

  // load
  self.load = function() {

    return Promise.all([
      new Promise(function(resolve) {
        PlayerImage.src    = 'person_cut_tiny.png'
        PlayerImage.onload = function() {
          playerTexture = TCTex(app.canvas.g, PlayerImage, PlayerImage.width, PlayerImage.height)
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

  self.create = function() {
    console.log('creating scene')

    app.canvas.bkg(0.133, 0.125, 0.204)


    player = new Player(playerTexture)





    // Music
    app.sound.music.playSong1()

    var count = 10
    var interval

    interval = setInterval(function() {
      count--

      app.sound.fx.playSound1()

      if (count === 0) {
        clearInterval(interval)
      }
    }, 300)
  }

  // create
  // update
  self.update = function() {
    //console.log('updating menu scene')

    player.update(app, self)
    // enemy update()
    // projectile.update()
    // foreground.update()

    // player projectiles colliding with enemies
    // player projectiles with wall
    // enemy projectiles colliding with player
    // enemy projectiles with wall
    // player colliding with enemies

  }

  // draw
  self.draw = function() {
    //console.log('drawing menu scene')
    player.draw(app)
  }

}
