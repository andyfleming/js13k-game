/**
 * Returns an objects that will be updated when keys are pressed and released.
 */
export default function keyboard() {

  var keys = {}

  document.addEventListener('keydown', function(e) {
    console.log(e.which + ' key DOWN')
    keys[e.which] = true
  })

  document.addEventListener('keyup', function(e) {
    //console.log(e.which + ' key UP')
    keys[e.which] = false
  })

  return keys

}
