// tailwind-rn.js
const { create } = require('tailwind-rn');
const styles = require('./styles.json');

const { tailwind } = create(styles);

module.exports = {
  tailwind,
}; 