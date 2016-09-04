import colliding from './colliding'

export default function handlePlayerEnemyCollisions(app, player, enemy) {

  if (!colliding(player.sprite, enemy.sprite)) {
    return
  }

  // If the player is "dashing" simulate the enemy flying up in the air
  if (player.dashing) {

    enemy.sprite.posY = 233

    setTimeout(function() {
      enemy.sprite.posY = 263
    }, 1000)

  } else {

    // Otherwise, simulate the player being knocked back and losing health
    player.sprite.posX += (player.lastXDirection === 'l') ? 40 : -40
    app.sound.fx.playHitSound()

  }



}
