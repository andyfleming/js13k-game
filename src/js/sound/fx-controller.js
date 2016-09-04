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

  console.log(pools)

  return function() {
    var pool = pools[sound.toString()]

    pool.players[pool.current].play()

    pool.current = ((pool.current + 1) === pool.players.length) ? 0 : pool.current + 1
  }
}

export default function FxController() {
  this.playJumpSound = createFx([0,,0.1472,,0.1057,0.3987,,0.257,,,,,,0.2339,,,,,0.8447,,,,,0.5])
  this.playHitSound = createFx([3,,0.0192,,0.1607,0.3916,,-0.5578,,,,,,,,,,,1,,,,,0.5])
  this.playDashSound = createFx([0,0.4,0.29,0.36,0.34,0.5768,,0.08,0.24,0.23,,0.1399,0.11,0.05,,0.54,,,1,,,0.0167,,0.5])
}
