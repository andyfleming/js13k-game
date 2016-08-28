/**
 * Returns an objects that will be updated when keys are pressed and released.
 */
export default function KeyboardController() {

  const self = this

  self.keys = {}

  document.addEventListener('keydown', function(e) {
    console.log(e.which + ' key DOWN')
    self.keys[e.which] = true
  })

  document.addEventListener('keyup', function(e) {
    //console.log(e.which + ' key UP')
    self.keys[e.which] = false
  })

}
