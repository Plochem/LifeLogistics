/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */

/*
  classifying colors to light or dark. Used to determine a fg color depending on a static bg color
  https://awik.io/determine-color-bright-dark-using-javascript/
  too lazy to conver to TS
*/
export default function lightOrDark(color) {
  // Variables for red, green, blue values
  let r
  let g
  let b

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    // eslint-disable-next-line no-param-reassign
    color = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    )

    r = color[1]
    g = color[2]
    b = color[3]
  } else {
    // If hex --> Convert it to RGB: http://gist.github.com/983661
    color = +`0x${color.slice(1).replace(color.length < 5 && /./g, '$&$&')}`

    r = color >> 16
    g = (color >> 8) & 255
    b = color & 255
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return 'light'
  }

  return 'dark'
}
