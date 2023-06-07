/**
 * Disables all buttons in the given array of components.
 *
 * @param {Array} msg - The message data containing the components.
 * @returns {Array} - The updated array of components with disabled buttons.
 */
module.exports = function disableButtons(msg) {
    const components = msg.components;
    for (let x = 0; x < components.length; x++) {
      for (let y = 0; y < components[x].components.length; y++) {
        components[x].components[y].data.disabled = true;
      }
    }
    return components;
  }
  