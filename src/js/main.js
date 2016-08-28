import './libs/tiny-canvas'
import KeyboardController from './controls/keyboard-controller'
import FxController from './sound/fx-controller'
import MusicController from './sound/music-controller'
import MenuScene from './scenes/menu-scene'
import CONFIG from './config/config'


// App
// manages:
// - sound
// -- fx
// -- music
// - animation/draw/update
// - keyboard/input
// - canvas + TC

function App() {

  const self = this

  self.scenes = {
    menu: new MenuScene(self),
    //game: new GameScene(self)
  }

  self.goToScene = function(name) {
    self.currentScene = self.scenes[name]
    self.currentScene.create()
  }

  self.runMainLoop = function() {
    requestAnimationFrame(self.runMainLoop)
    self.currentScene.update()
    self.canvas.cls()
    self.currentScene.draw()
    self.canvas.flush()
  }

  // -------------------------------------------------
  // INITIALIZE APP
  // -------------------------------------------------

  // Import config
  self.config = CONFIG

  // Set up music and fx controllers
  self.sound = {
    fx: new FxController(),
    music: new MusicController()
  }

  // Set up keyboard input
  self.keys = new KeyboardController()

  // Create tiny canvas instance from canvas el
  self.canvas = TC(document.getElementById('c'))

  // loop through scenes and load
  Promise.all([
    self.scenes.menu.load()
    //self.scenes.game.load()
  ]).then(function() {
    self.goToScene('menu')
    self.runMainLoop()
  }).catch(function(err) { console.error(err) })

}

new App()

// Scene
// - pausing
// .start()
// .end()
