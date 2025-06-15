const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

const INTERNAL = new Set(['parser', 'parse_args', 'fs', 'klsh']);

describe('Component interface compliance', function () {
  Object.keys(klsh)
    .filter(n => !INTERNAL.has(n))
    .forEach(name => {
      it(`${name} exposes required functions`, function () {
        const c = klsh[name];
        expect(c).to.be.an('object');
        expect(c).to.have.property('main').that.is.a('function');
        expect(c).to.have.property('getDescription').that.is.a('function');
        expect(c).to.have.property('getOptions').that.is.a('function');
      });
    });
});
