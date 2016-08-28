import Player from '../entities/player'
import Sprite from '../graphics/sprite'

export default function GameScene(app) {

  var self = this

  // entities
  var player

  // Images and textures
  var groundImage = new Image()
  var groundTexture
  var groundSprite
  var playerImage = new Image()
  var playerTexture
  var enemyImage = new Image()
  var enemyTexture

  // load
  self.load = function() {

    return Promise.all([
      new Promise(function(resolve) {
        groundImage.src    = 'ground_tiny.png'
        groundImage.onload = function() {
          groundTexture = TCTex(app.canvas.g, groundImage, groundImage.width, groundImage.height)
          resolve()
        }
      }),
      new Promise(function(resolve) {
        playerImage.src    = 'person_cut_tiny.png'
        playerImage.onload = function() {
          playerTexture = TCTex(app.canvas.g, playerImage, playerImage.width, playerImage.height)
          resolve()
        }
      }),
      new Promise(function(resolve) {
        enemyImage.src = 'enemy1.png'
        enemyImage.onload = function() {
          enemyTexture = TCTex(app.canvas.g, enemyImage, enemyImage.width, enemyImage.height)
          resolve()
        }
      })
    ]).catch(function(err) { console.error(err) })
  }

  self.create = function() {
    console.log('creating scene')

    app.canvas.bkg(0.133, 0.125, 0.204)

    groundSprite = new Sprite(0, 283, groundTexture, [[0, 0, 700, 17]], 0, 1)

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

    groundSprite._draw(app.canvas)
    player.draw(app)
  }

}
