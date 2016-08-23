/**
 * Returns an objects that will be updated when keys are pressed and released.
 */
export default function keyboard() {

  var keys = {}

  document.addEventListener('keydown', function(e) {
    keys[e.key] = true
  })

  document.addEventListener('keyup', function(e) {
    keys[e.key] = false
  })

  return keys

}
