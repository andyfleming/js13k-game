import jsfxr from '../libs/jsfxr'

var POOL_SIZE = 10
var pools = {}

function createFx(sound) {
  var soundURL = jsfxr(sound)

  pools[sound.toString()] = {
    current: 0,
    players: []
  }

  for (var i = 0; i < POOL_SIZE; i++) {
    var player = new Audio()
    player.src = soundURL
    pools[sound.toString()].players.push(player)
  }

  return function() {
    var pool = pools[sound.toString()]

    pool.players[pool.current].play()

    pool.current = ((pool.current + 1) === pool.players.length) ? 0 : pool.current + 1
  }
}

export default function FxController() {
  this.playJumpSound = createFx([0,,0.1472,,0.1057,0.3987,,0.257,,,,,,0.2339,,,,,0.8447,,,,,0.5])
  this.playHitSound = createFx([3,,0.0192,,0.1607,0.3916,,-0.5578,,,,,,,,,,,1,,,,,0.5])
  this.playDashSound = createFx([0,,0.2123,,0.2532,0.46,,0.1208,,,,,,0.1542,,,,,1,,,0.1776,,0.5])
  this.playShoot = createFx([0,,0.1577,0.0959,0.2757,0.5002,0.0559,-0.5441,,,,,,0.5769,-0.5699,,,,1,,,0.0851,,0.5])
  this.playEnemyHit = createFx([0,,0.0968,,0.2989,0.2028,,-0.4879,,,,,,0.0846,,,,,1,,,0.0167,,0.5])
  this.playBulletHit = createFx([3,,0.1011,0.6147,0.1556,0.0835,,-0.2458,,,,,,,,,,,1,,,,,0.5])
}
