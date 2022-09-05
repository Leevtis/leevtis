
const {
  etherMantissa,
  both
} = require('../Utils/Ethereum');

const {
  makeComptroller,
  makePriceOracle,
  makeCToken,
  makeToken
} = require('../Utils/Compound');

describe('Comptroller', () => {
  let root, accounts;

  beforeEach(async () => {
    [root, ...accounts] = saddle.accounts;
  });

  describe('constructor', () => {
    it("on success it sets admin to creator and pendingAdmin is unset", async () => {
      const comptroller = await makeComptroller();
      expect(await call(comptroller, 'admin')).toEqual(root);
      expect(await call(comptroller, 'pendingAdmin')).toEqualNumber(0);
    });
