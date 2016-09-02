export default {

  // Key codes:
  // Space: 32
  // a: 65
  // d: 68
  // i: 73
  // j: 74
  // k: 75

  KEY: {
    //MOVE_LEFT: 'ArrowLeft',
    //MOVE_RIGHT: 'ArrowRight',
    //JUMP: 'ArrowUp'
    MOVE_LEFT: 65, // a
    MOVE_RIGHT: 68, // d
    JUMP: 74, // space
    SHOOT: 73, // j
    DASH: 75, // k
    TIMEWARP: 16 // shift
  },

  PLAYER: {
    JUMP_SPEED: 6,
    JUMP_LENGTH: 5,
    WALK_SPEED: 1,
    WALK_SPEED_MAX: 4,
    DASH_SPEED: 10,
    WALL_FALL_SPEED: 1.5
  },

  ENEMY: {
    MOVE_SPEED: 2
  },

  WORLD: {
    GRAVITY: 0.5
  }

}
