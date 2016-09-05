import './libs/tiny-canvas'
import KeyboardController from './controls/keyboard-controller'
import FxController from './sound/fx-controller'
import MusicController from './sound/music-controller'
import MenuScene from './scenes/menu-scene'
import GameScene from './scenes/game-scene'
import CONFIG from './config/config'

function App() {

  var self = this

  self.frameCount = 0

  self.scenes = {
    menu: new MenuScene(self),
    game: new GameScene(self)
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
    self.frameCount++
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
  var keyboardController = new KeyboardController()
  self.keys = keyboardController.keys

  // Create tiny canvas instance from canvas el
  self.canvas = TC(document.getElementById('c'))

  // loop through scenes and load
  Promise.all([
    self.scenes.menu.load(),
    self.scenes.game.load()
  ]).then(function() {
    self.goToScene('menu')
    self.runMainLoop()
  })

}

new App()
