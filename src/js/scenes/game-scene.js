import Player from '../entities/player'
import Enemy from '../entities/enemy'
import Sprite from '../graphics/sprite'
import handlePlayerEnemyCollisions from '../collisions/handle-player-enemy-collisions'

export default function GameScene(app) {

  var self = this

  // entities
  var player
  var enemies = []
  var projectiles = []

  // Images and textures
  var groundImage = new Image()
  var groundTexture
  var groundSprite
  var platformImage = new Image()
  var platformTexture
  var platform1Sprite
  var platform2Sprite
  //var platform3Sprite
  var playerImage = new Image()
  var playerTexture
  var enemyImage = new Image()
  var enemyTexture

  function loadImage(src, image) {
    return new Promise(function(resolve) {
      image.src    = src
      image.onload = function() {
        resolve(TCTex(app.canvas.g, image, image.width, image.height))
      }
    })
  }

  // load
  self.load = function() {
    return Promise.all([
      loadImage('platform_exp_1_tiny.png', platformImage).then(function(t) { platformTexture = t }),
      loadImage('ground_tiny.png', groundImage).then(function(t) { groundTexture = t }),
      loadImage('person_cut_tiny.png', playerImage).then(function(t) { playerTexture = t }),
      loadImage('enemy1.png', enemyImage).then(function(t) { enemyTexture = t }),
    ])
  }

  self.create = function() {
    console.log('creating scene')

    app.canvas.bkg(0.133, 0.125, 0.204)

    // World sprites
    groundSprite = new Sprite(0, 283, groundTexture, [[0, 0, 700, 17]], 0, 1)
    platform1Sprite = new Sprite(100, 200, platformTexture, [[0, 0, 132, 9]], 0, 1)
    platform2Sprite = new Sprite(468, 200, platformTexture, [[0, 0, 132, 9]], 0, 1)
    //platform3Sprite = new Sprite(284, 125, platformTexture, [[0, 0, 132, 9]], 0, 1)


    player = new Player(playerTexture)

    enemies.push(
      new Enemy(enemyTexture, 450),
      new Enemy(enemyTexture, 474),
      new Enemy(enemyTexture, 500)
    )

    // Music
    app.sound.music.playSong1()

  }

  self.update = function() {

    player.update(app, self)
    enemies.forEach(function(enemy) {
      enemy.update(app, self)
    })
    projectiles.forEach(function(proj) {
      proj.update(app, self)
    })
    // foreground.update()

    // player projectiles colliding with enemies
    // player projectiles with wall
    // enemy projectiles colliding with player
    enemies.forEach(function(enemy) {
      handlePlayerEnemyCollisions(app, player, enemy)
    })
    // enemy projectiles with wall
    // player colliding with enemies

  }

  self.draw = function() {
    //console.log('drawing menu scene')

    // World draws
    groundSprite._draw(app.canvas)
    platform1Sprite._draw(app.canvas)
    platform2Sprite._draw(app.canvas)
    //platform3Sprite._draw(app.canvas)
    // Platform 3 (upper) is disabled since I don't think the player will be vulnerable enough on the ground otherwise

    // enemy draws
    enemies.forEach(function(enemy, index) {
      enemy.draw(app)
    })

    // Player draw
    player.draw(app)

    // TODO: projectile draws
    projectiles.forEach(function(proj) {
      proj.draw(app)
    })

    // TODO: other draws; particles?

  }

}
