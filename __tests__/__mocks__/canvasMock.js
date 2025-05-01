// Mock Canvas module
module.exports = {
  createCanvas: () => ({
    getContext: () => ({
      measureText: () => ({ width: 10 }),
      fillText: () => {},
      drawImage: () => {},
      fillRect: () => {},
    }),
  }),
  Image: function() {
    this.onload = () => {};
  },
};