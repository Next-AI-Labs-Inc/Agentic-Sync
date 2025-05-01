const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3020',
    specPattern: 'cypress/e2e/data-model-documentation.cy.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    experimentalOriginDependencies: false,
    testIsolation: false,
    viewportWidth: 1280,
    viewportHeight: 720
  },
})