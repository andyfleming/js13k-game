import colliding from './colliding'

export default function handleProjectileEnemyCollisions(app, scene, projectile, enemy) {

  if (!colliding(projectile.sprite, enemy.sprite)) {
    return
  }

  console.log('enemy hit')

  app.sound.fx.playEnemyHit()
  scene.removeEnemy(enemy.index)
  scene.removeProjectile(projectile.index)

}
