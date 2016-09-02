/**
 * Checks if two rectangular sprites are colliding
 *
 * @param {Sprite} s1 Entity 1
 * @param {Sprite} s2 Entity 2
 *
 * @todo Consier if we want sprites to have independent hit boxes
 */
export default function colliding(s1, s2) {

  return (
    s1.posX < s2.posX + s2.width &&
    s1.posX + s1.width > s2.posX &&
    s1.posY < s2.posY + s2.height &&
    s1.height + s1.posY > s2.posY
  )

}
