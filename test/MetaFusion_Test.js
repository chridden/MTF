var MetaFusion = artifacts.require('./MetaFusion.sol')

contract('MetaFusion', function (accounts) {
  // We check if the MetaFusion contract has been deployed
  // We then check if the owner has a balance of 100,000,000 * 10^5 as there is 5 decimal places
  it('should put 100,000,000.00000 MetaFusion in the owners account', function () {
    return MetaFusion.deployed().then(function (instance) {
      return instance.balanceOf.call(accounts[0])
    }).then(function (balance) {
      assert.equal(balance.valueOf(), 10000000000000, "100,000,000.00000 wasn't in the first account")
    })
  })

  // We then check if the total supply is 100,000,000 * 10^5
  it('should be 100,000,000.00000 MetaFusion in supply', function () {
    return MetaFusion.deployed().then(function (instance) {
      return instance.totalSupply.call()
    }).then(function (supply) {
      assert.equal(supply.valueOf(), 10000000000000, "100,000,000.00000 wasn't in circulation")
    })
  })

  // The owner should be able to offer another account an 'allowance' which they can use to transfer from
  it('should let the owner give an allowance', function () {

    var owner = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];

    var ownerStartingBalance;
    var receiverStartingBalance;

    var spenderAllowance;

    var ownerOneEndingBalance;
    var receiverEndingBalance;

    var amount = 10;

    return MetaCoin.deployed().then(function (instance) {
      meta = instance

      // CHECKING STARTING BALANCES

      return meta.balanceOf.call(owner)
    }).then(function (balance) {
      ownerStartingBalance = balance.toNumber()
      return meta.balanceOf.call(receiver)
    }).then(function (balance) {
      receiverStartingBalance = balance.toNumber()

      // ISSUING ALLOWANCE

      return meta.approve(spender, amount, { from: owner })
    }).then(function () {
      return meta.allowance.call(owner, spender)
    }).then(function (allowance) {
      spenderAllowance = allowance;

      // DOING A TRANFER FROM

      return meta.transferFrom(spender, receiver, amount)
    }).then(function () {

      // CHECKING ENDING BALANCES

      return meta.balanceOf.call(owner)
    }).then(function (balance) {
      ownerEndingBalance = balance.toNumber()
      return meta.balanceOf.call(receiver)
    }).then(function (balance) {
      receiverEndingBalance = balance.toNumber()

      // ASSERTING BALANCES

      assert.equal(
        ownerEndingBalance,
        ownerStartingBalance - amount,
        "Amount wasn't correctly taken from the owner"
      )
      assert.equal(
        receiverEndingBalance,
        receiverStartingBalance + amount,
        "Amount wasn't correctly sent to the receiver"
      )
      assert.equal(
        spenderAllowance,
        amount,
        "Allowance wasn't correctly set for spender"
      )
    })
  })

    // The owner should be able to offer another account an 'allowance' which they can use to transfer from
  it('should not let the spender spend coins without an allowance', function () {

    var owner = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];

    var ownerStartingBalance;
    var receiverStartingBalance;

    var ownerOneEndingBalance;
    var receiverEndingBalance;

    return MetaCoin.deployed().then(function (instance) {
      meta = instance

      // CHECKING STARTING BALANCES

      return meta.balanceOf.call(owner)
    }).then(function (balance) {
      ownerStartingBalance = balance.toNumber()
      return meta.balanceOf.call(receiver)
    }).then(function (balance) {
      receiverStartingBalance = balance.toNumber()

      // DOING A TRANFER FROM WITH NO ALLOWANCE

      return meta.transferFrom(spender, receiver, amount)
    }).then(function () {

      // CHECKING ENDING BALANCES

      return meta.balanceOf.call(owner)
    }).then(function (balance) {
      ownerEndingBalance = balance.toNumber()
      return meta.balanceOf.call(receiver)
    }).then(function (balance) {
      receiverEndingBalance = balance.toNumber()

      // ASSERTING BALANCES

      assert.equal(
        ownerEndingBalance,
        ownerStartingBalance,
        "Amount was incorrectly taken from the owner"
      )
      assert.equal(
        receiverEndingBalance,
        receiverStartingBalance,
        "Amount was incorrectly sent to the receiver"
      )
    })
  })

  it('should send coin correctly', function () {
    var meta

    //    Get initial balances of first and second account.
    var spender = accounts[0]
    var receiver = accounts[1]

    var accountOneStartingBalance
    var accountTwoStartingBalance
    var accountOneEndingBalance
    var accountTwoEndingBalance

    var amount = 10

    return MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.getBalance.call(accountOne)
    }).then(function (balance) {
      accountOneStartingBalance = balance.toNumber()
      return meta.getBalance.call(accountTwo)
    }).then(function (balance) {
      accountTwoStartingBalance = balance.toNumber()
      return meta.sendCoin(accountTwo, amount, { from: accountOne })
    }).then(function () {
      return meta.getBalance.call(accountOne)
    }).then(function (balance) {
      accountOneEndingBalance = balance.toNumber()
      return meta.getBalance.call(accountTwo)
    }).then(function (balance) {
      accountTwoEndingBalance = balance.toNumber()

      assert.equal(
        accountOneEndingBalance,
        accountOneStartingBalance - amount,
        "Amount wasn't correctly taken from the sender"
      )
      assert.equal(
        accountTwoEndingBalance,
        accountTwoStartingBalance + amount,
        "Amount wasn't correctly sent to the receiver"
      )
    })
  })
})
