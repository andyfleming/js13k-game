import jsfxr from '../libs/jsfxr'

function createFx(sound) {
  var soundURL = jsfxr(sound)
  var player   = new Audio()
  player.src   = soundURL

  return function() {
    player.play()
  }
}

export default function FxController() {

  this.playSound1 = createFx([0, , 0.1812, , 0.1349, 0.4524, , 0.2365, , , , , , 0.0819, , , , , 1, , , , , 0.5])

}
