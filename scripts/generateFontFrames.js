var TEXT = {
  '0': [180,5],
  '1': [136,4],
  '2': [140,5],
  '3': [145,5],
  '4': [150,5],
  '5': [155,5],
  '6': [160,5],
  '7': [165,5],
  '8': [170,5],
  '9': [175,5],
  ' ': [185,5],
  'a': [0,5],
  'b': [5,5],
  'c': [10,5],
  'd': [15,5],
  'e': [20,5],
  'f': [25,5],
  'g': [30,5],
  'h': [35,5],
  'i': [41,3],
  'j': [43,5],
  'k': [48,5],
  'l': [53,5],
  'n': [58,6],
  'm': [64,6],
  'o': [70,5],
  'p': [75,5],
  'q': [80,5],
  'r': [85,5],
  's': [90,5],
  't': [95,5],
  'u': [100,6],
  'v': [106,6],
  'w': [112,6],
  'x': [118,6],
  'y': [124,6],
  'z': [130,6],
}

var char = ''
var offset = 315

console.log('var TEXT = {')
for (char in TEXT) {
  TEXT[char][0] += offset
  if (isNaN(char)) console.log(`  ${char}: [${TEXT[char]}],`)
  else console.log(`  '${char}': [${TEXT[char]}],`)
};
console.log('}')
