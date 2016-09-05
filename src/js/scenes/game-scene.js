import Player from '../entities/player'
import Enemy from '../entities/enemy'
import Bullet from '../entities/bullet'
import Sprite from '../graphics/sprite'
import loadImage from '../graphics/load-image'
import handlePlayerEnemyCollisions from '../collisions/handle-player-enemy-collisions'
import handleProjectileEnemyCollisions from '../collisions/handle-projectile-enemy-collisions'
import RainForeground from '../entities/rain-foreground'

export default function GameScene(app) {

  var self = this

  // Scene state
  self.timewarp = false

  // entities
  var player
  var enemies = []
  var projectiles = []
  var projectilesIndex = 0

  // Images and textures
  var groundImage = new Image()
  var groundTexture
  var groundSprite
  var platformImage = new Image()
  var platformTexture
  var platform1Sprite
  var platform2Sprite
  //var platform3Sprite
  var foreground
  var rainImage = new Image()
  var rainTexture
  var playerImage = new Image()
  var playerTexture
  var enemyImage = new Image()
  var enemyTexture
  var bulletImage = new Image()
  var bulletTexture

  // load
  self.load = function() {
    return Promise.all([
      loadImage(app, 'platform_exp_1_tiny.png', platformImage).then(function(t) { platformTexture = t }),
      loadImage(app, 'ground_tiny.png', groundImage).then(function(t) { groundTexture = t }),
      loadImage(app, 'hero.tiny.png', playerImage).then(function(t) { playerTexture = t }),
      loadImage(app, 'enemy1.png', enemyImage).then(function(t) { enemyTexture = t }),
      loadImage(app, 'bullet.tiny.png', bulletImage).then(function(t) { bulletTexture = t }),
      loadImage(app, 'rain_pixel.png', rainImage).then(function(t) { rainTexture = t }),
    ])
  }

  self.create = function() {

    app.canvas.bkg(0.133, 0.125, 0.204)

    // World sprites
    groundSprite = new Sprite(0, 283, groundTexture, [[0, 0, 700, 17]], 0, 1)
    platform1Sprite = new Sprite(100, 200, platformTexture, [[0, 0, 132, 9]], 0, 1)
    platform2Sprite = new Sprite(468, 200, platformTexture, [[0, 0, 132, 9]], 0, 1)
    //platform3Sprite = new Sprite(284, 125, platformTexture, [[0, 0, 132, 9]], 0, 1)


    player = new Player(playerTexture)

    enemies.push(
      new Enemy(enemyTexture, 450, 0),
      new Enemy(enemyTexture, 474, 1),
      new Enemy(enemyTexture, 500, 2),
      new Enemy(enemyTexture, 505, 3),
      new Enemy(enemyTexture, 510, 4),
      new Enemy(enemyTexture, 515, 5)
    )

    foreground = new RainForeground(rainTexture, app.canvas.c.width, app.canvas.c.height)

    // Music
    app.sound.music.playSong1()
  }

  self.spawnBullet = function(x, y, lastXDirection) {
    projectiles[projectilesIndex] = new Bullet(bulletTexture, x, y, lastXDirection, projectilesIndex++)
  }

  self.removeProjectile = function(index) {
    projectiles[index] = null
  }

  self.removeEnemy = function(index) {
    enemies[index] = null
  }


  self.update = function() {

    player.update(app, self)
    enemies.forEach(function(enemy) {
      if (enemy) {
        enemy.update(app, self)
      }
    })
    projectiles.forEach(function(proj) {
      if (proj) {
        proj.update(app, self)
      }
    })

    // Update rain foreground
    foreground.update(self.timewarp)

    // player projectiles colliding with enemies
    enemies.forEach(function(enemy) {
      if (enemy) {
        projectiles.forEach(function(proj) {
          if (proj) {
            handleProjectileEnemyCollisions(app, self, proj, enemy)
          }
        })
      }
    })
    // player projectiles with wall
    // enemy projectiles colliding with player
    enemies.forEach(function(enemy) {
      if (enemy) {
        handlePlayerEnemyCollisions(app, player, enemy)
      }
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
    enemies.forEach(function(enemy) {
      if (enemy) {
        enemy.draw(app)
      }
    })

    // Player draw
    player.draw(app)

    // TODO: projectile draws
    projectiles.forEach(function(proj) {
      if (proj) {
        proj.draw(app)
      }
    })

    // TODO: other draws; particles?

    // Draw rain foreground
    foreground.draw(app.canvas)

  }

}
