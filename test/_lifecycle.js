const { sha3 } = require('web3-utils')
const { assertRevert } = require('@aragon/contract-helpers-test/src/asserts')
const { ZERO_ADDRESS } = require('@aragon/contract-helpers-test')

const ACL = artifacts.require('ACL')
const Kernel = artifacts.require('Kernel')
const KernelProxy = artifacts.require('KernelProxy')
const AragonApp = artifacts.require('AragonApp')

// Mocks
const UnsafeAragonAppMock = artifacts.require('UnsafeAragonAppMock')

const FAKE_ROLE = sha3('FAKE_ROLE')

contract('App base lifecycle', ([permissionsRoot]) => {
  let aclBase, kernelBase

  before(async () => {
    kernelBase = await Kernel.new(true) // petrify immediately
    aclBase = await ACL.new()
  })

  context('> AragonApp', () => {
    let app

    beforeEach(async () => {
      app = await AragonApp.new()
    })

    it('is not initialized', async () => {
      assert.isFalse(await app.hasInitialized(), 'should not be initialized')
    })

    it('is petrified', async () => {
      assert.isTrue(await app.isPetrified(), 'should be petrified')
    })

    it('does not have initialization function', async () => {
      assert.isNotFunction(app.initialize, 'base AragonApp should not have initialize')
    })

    it('should not be usable', async () => {
      assert.isFalse(await app.canPerform(permissionsRoot, FAKE_ROLE, []))
    })
  })

  context('> UnsafeAragonApp', () => {
    let app

    beforeEach(async () => {
      // Use the mock so we can initialize and set the kernel
      app = await UnsafeAragonAppMock.new()
    })

    it('is not initialized by default', async () => {
      assert.isFalse(await app.hasInitialized(), 'should not be initialized')
    })

    it('is not petrified by default', async () => {
      assert.isFalse(await app.isPetrified(), 'should not be petrified')
    })

    it('should not be usable yet', async () => {
      assert.isFalse(await app.canPerform(permissionsRoot, FAKE_ROLE, []))
    })

    context('> Initialized', () => {
      beforeEach(async () => {
        await app.initialize()
      })

      it('is now initialized', async () => {
        assert.isTrue(await app.hasInitialized(), 'should be initialized')
      })

      it('is still not petrified', async () => {
        assert.isFalse(await app.isPetrified(), 'should not be petrified')
      })

      it('has correct initialization block', async () => {
        assert.equal(await app.getInitializationBlock(), await web3.eth.getBlockNumber(), 'initialization block should be correct')
      })

      it('throws on reinitialization', async () => {
        await assertRevert(app.initialize())
      })

      it('should still not be usable without a kernel', async () => {
        assert.equal(await app.getKernel(), ZERO_ADDRESS, 'app should still be missing kernel reference')

        assert.isFalse(await app.canPerform(permissionsRoot, FAKE_ROLE, []))
      })

      context('> Set kernel', () => {
