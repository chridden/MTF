require('babel-polyfill');

var MetaFusionSale = artifacts.require('./SALE_mtf.sol');
var MetaFusionToken = artifacts.require('./ERC20_mtf_allowance.sol');
var SecondSale = artifacts.require("./Second_sale.sol");

import { default as Web3} from 'web3';

// Specification

// MetaFusion crowdsale:

// Soft cap:     None
// Hard cap:     None
// Commission:   1% of funds to Iconemy
// Pricing:      Linear (single price)
// Start date:   Needs to be supplied
// End date:     Needs to be supplied
// Stoppable:    Yes
// Refundable:   Yes

// Extra notes:  The owner wants to be able to re-sell coins in another crowdsale at a later date therefore, we will allow him to keep the coins in his wallet, then give the crowdsale contract an allowance to spend on his behalf. If all tokens are not sold, he will still own the tokens and will be able to give another sale an allowance so that can sell more coins at a later date. 

// Should initialise the sale owner - X
// Should not allow someone to buy tokens before the start date - X
// Should not allow someone to buy tokens after the end date - X
// Should not allow someone to buy tokens until an allowance has been allocated - X
// Should not allow someone to buy tokens if all of the allowance has been spent
// Should allow the owner to stop the sale 
// Should not allow someone to buy tokens if sale has been stopped
// Should allow the user to refund anyone who has purchased during the sale - X
// Should allow a refunded user to collect the ETH they invested - X
// Should allow someone to buy tokens when the allowance has been set, and the date is between start/end date - X
// Should allocate 1% of the funds raised to an Iconemy wallet
// Should allow owner to withdraw funds after successful completion of the sale (not stopped) - X
// Should not allow owner to withdraw funds before completion of the sale - X
// Should not allow owner to withdraw funds after unsuccessful completion of the sale (was stopped)

// Should allow the owner to re-allocate remaining tokens to another sale after completion - X
// should allow users to buy more tokens in a re-allocated sale - X

// These tests run through 2 independent sales:
// We start the first sale, allocate an allowance, fast forward to the start time and allow people buy tokens
// We then refund the first user that buy tokens and allow them to collect their investment
// We then start another sale after the first one which allows investors to purchase more tokens after the allowance has been set

contract('MetaFusionSale', function (accounts) {

  const moment = require('moment');

  // This is used to test if a buyer can buy tokens from two independent sales if the owner allocates an allowance to another sale after the first one is completed. 
  var buyersFirstBalance;

  // Used to get the ETH balance of a user
  // --------------------------------------------------- 
  const promisify = (inner) =>
    new Promise((resolve, reject) =>
      inner((err, res) => {
        if (err) { reject(err) }
        resolve(res);
      })
    );

  const getBalance = (account, at) =>
    promisify(cb => web3.eth.getBalance(account, at, cb));
  // --------------------------------------------------- 

  // This will check that the owners address is the same as the one set in the constructor. 
  it('Should initialise owner address', async function() {
    var sale;
    var owner;

    sale = await MetaFusionSale.deployed();
    owner = await sale.owner();

    assert.equal(owner.valueOf(),  accounts[0], "Owner was not set correctly");
  });

  // This expects the sale to store 'hasAllowance = true' when approveAndCall is called veiw the owner. 
  it('Should allow the owner to set an allocation for the sale', async function() {
    var sale;
    var token;
    var owner = accounts[0];

    sale = await MetaFusionSale.deployed();
    token = await MetaFusionToken.deployed();

    // This sets an allowance of 100,000,000.00000 tokens for the sale to sell (up to all the tokens) 
    var result = await token.approveAndCall(sale.address, 110000000, {from: owner});
    var allocated = await sale.hasApproval();

    assert.equal(allocated.valueOf(), true, "Allowance was not set correctly");
  });

  // This expects the sale to reject purchases if the current time is below the start time
  it('Should not allow someone to buy tokens before the start time', async function() {
    var sale;
    var token;
    var buyer = accounts[1];

    sale = await MetaFusionSale.deployed();
    token = await MetaFusionToken.deployed();

    // This sets an allowance of 100,000,000.00000 tokens for the sale to sell (up to all the tokens) 
    var result = await sale.buyTokens({value: web3.toWei(0.5, "ether"), from: buyer});
    var balance = await token.balanceOf()({from: buyer});

    assert.equal(balance.valueOf(), 0, "Someone could buy tickets before the start time");
  });

  // This mines blocks on the fly on our test chain so that we can 'time travel' during tests. 
  it("should successfully time travel to start of sale", async function () {
    let time_now;
    let time_after;

    time_now = await web3.eth.getBlock("latest").timestamp;
    await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [200], id: 123});
    await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
    time_after = await web3.eth.getBlock("latest").timestamp;
       
    assert.isBelow(time_now, time_after, "didnt time travel");
  });

  // This expects the sale to accept purchases if the current time is after the start time
  it('Should allow someone to buy tokens after the start time', async function() {
    var sale;
    var token;
    var buyer = accounts[1];

    sale = await MetaFusionSale.deployed();
    token = await MetaFusionToken.deployed();

    var result = await sale.buyTokens({value: web3.toWei(0.5, "ether"), from: buyer});

    var balance = await token.balanceOf(buyer, {from: buyer});

    assert.isAbove(balance.valueOf(), 0, "Someone could not buy tokens after the start time");
  });

  // This expects the sale to accept purchases if the current time is after the start time
  it('Should allow someone to buy tokens after the start time', async function() {
    var sale;
    var token;
    var buyer = accounts[2];

    sale = await MetaFusionSale.deployed();
    token = await MetaFusionToken.deployed();

    // This sets an allowance of 100,000,000.00000 tokens for the sale to sell (up to all the tokens) 
    var result = await sale.buyTokens({value: web3.toWei(0.5, "ether"), from: buyer});
    var balance = await token.balanceOf(buyer, {from: buyer});
    buyersFirstBalance = balance.valueOf();

    assert.isAbove(balance.valueOf(), 0, "Someone could not buy tickets after the start time");
  });

  it('should not allow the owner to collect the funds from a sale before completion', async function() {
    var sale;
    var owner = accounts[0];
    var ownerStartingBalance;
    var ownerEndingBalance;

    ownerStartingBalance = await getBalance(owner);

    sale = await MetaFusionSale.deployed();

    // This sets an allowance of 100,000,000.00000 tokens for the sale to sell (up to all the tokens) 
    var result = await sale.collectInvestment({from: owner});

    ownerEndingBalance = await getBalance(owner);

    assert.equal(ownerStartingBalance, ownerEndingBalance, "Owner could withdraw investments before a sale has completed");
  });

  it("should successfully time travel to end of sale", async function () {
    let time_now;
    let time_after;

    time_now = await web3.eth.getBlock("latest").timestamp;
    await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [3600], id: 123});
    await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
    time_after = await web3.eth.getBlock("latest").timestamp;

    assert.isBelow(time_now, time_after, "didnt time travel");
  });

  it("should have ended the sale", async function() {
    var sale;
    var result;

    sale = await MetaFusionSale.deployed();
    result = await sale.hasEnded();

    assert.equal(result.valueOf(), true, "Crowdsale should have ended");
  });

  // This expects the sale to reject purchases if the current time is after the end time
  it('should not allow someone to buy tokens after the end time', async function() {
    var sale;
    var token;
    var buyer = accounts[4];

    sale = await MetaFusionSale.deployed();
    token = await MetaFusionToken.deployed();

    // This sets an allowance of 100,000,000.00000 tokens for the sale to sell (up to all the tokens) 
    var result = await sale.buyTokens({value: web3.toWei(0.5, "ether"), from: buyer});
    var balance = await token.balanceOf({from: buyer});

    assert.equal(balance.valueOf(), 0, "Someone could buy tokens after the end time");
  });

  it('should allow the owner to collect the funds from a sale after completion', async function() {
    var sale;
    var owner = accounts[0];
    var ownerStartingBalance;
    var ownerEndingBalance;

    ownerStartingBalance = await getBalance(owner);

    sale = await MetaFusionSale.deployed();

    // This sets an allowance of 100,000,000.00000 tokens for the sale to sell (up to all the tokens) 
    var result = await sale.collectInvestment({from: owner});

    ownerEndingBalance = await getBalance(owner);

    assert.isAbove(ownerStartingBalance, ownerEndingBalance, "Owner could not withdraw investments after a sale");
  });

  // This expects the sale to reject purchases if the current time is after the end time
  it('should allow iconemy to collect their commission', async function() {
    var sale;
    var token;
    var iconemy = accounts[3];

    sale = await MetaFusionSale.deployed();
    token = await MetaFusionToken.deployed();

    // This sets an allowance of 100,000,000.00000 tokens for the sale to sell (up to all the tokens) 
    var result = await sale.collectCommission({from: iconemy});

    var ending_balance = await token.balanceOf(iconemy, {from: iconemy});

    assert.equal(ending_balance.valueOf(), 1000000, "Iconemy did not recieve 1% of the sales commission");
  });




  // ------------- NEW SALE -----------------------




  // This mines blocks on the fly on our test chain so that we can 'time travel' during tests. 
  it("should successfully time travel to start of sale", async function () {
    let time_now;
    let time_after;

    time_now = await web3.eth.getBlock("latest").timestamp;
    await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [15000], id: 123});
    await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
    time_after = await web3.eth.getBlock("latest").timestamp;

    var sale = await SecondSale.deployed();
    var start = await sale.startTime();
    var end = await sale.endTime();
    var ended = await sale.hasEnded();

    assert.isBelow(start.valueOf(), time_after, "didnt travel to start");
    assert.equal(ended.valueOf(), false, "travelled past end");
    assert.isBelow(time_now, time_after, "didnt time travel");
  });

  // This expects the sale to reject purchases if the allowance hasnt been set
  it('Should not allow someone to buy tokens if an allowance hasnt been set', async function() {
    var sale;
    var token;
    var buyer = accounts[4];

    sale = await SecondSale.deployed();
    token = await MetaFusionToken.deployed();

    // This sets an allowance of 100,000,000.00000 tokens for the sale to sell (up to all the tokens) 
    var result = await sale.buyTokens({value: web3.toWei(0.5, "ether"), from: buyer});
    var balance = await token.balanceOf(owner, {from: buyer});

    assert.equal(balance.valueOf(), 0, "Buyer could buy tokens before allowance was set");
  });

    // This will check that the owners address is the same as the one set in the constructor. 
  it('Should initialise owner address', async function() {
    var sale2;
    var owner;

    sale2 = await SecondSale.deployed();
    owner = await sale2.owner();

    assert.equal(owner.valueOf(),  accounts[0], "Owner was not set correctly");
  });


  // This expects the sale to store 'hasAllowance = true' when approveAndCall is called veiw the owner. 
  it('Should allow the owner to set an allocation for the next sale', async function() {
    var sale2;
    var token;
    var owner = accounts[0];

    sale2 = await SecondSale.deployed();
    token = await MetaFusionToken.deployed();

    console.log(sale2.address);

    var balance = await token.balanceOf(owner, {from: owner});

    console.log(balance.valueOf());

    // This sets an allowance of remaining tokens for the sale to sell (up to all the tokens) 
    var result = await token.approveAndCall(sale2.address, 110000000, {from: owner});
    // var allocated = await sale.hasApproval();

    // assert.equal(allocated.valueOf(), true, "Allowance was not set correctly");
  });

  it("should not have ended the sale", async function() {
    var sale;
    var result;

    sale = await SecondSale.deployed();

    var time_after = await web3.eth.getBlock("latest").timestamp;
    var end = await sale.endTime();

    result = await sale.hasEnded();

    assert.equal(result.valueOf(), false, "Crowdsale should not have ended");
  });

  // // This expects the sale to accept purchases in another sale after the first one
  // it('Should allow someone to buy further tokens in another sale', async function() {
  //   var sale;
  //   var token;
  //   var buyer = accounts[2];

  //   sale = await MetaFusionSale.deployed();
  //   token = await MetaFusionToken.deployed();

  //   var buyersFirstBalance = await token.balanceOf(buyer, {from: buyer});

  //   // This sets an allowance of 100,000,000.00000 tokens for the sale to sell (up to all the tokens) 
  //   var result = await sale.buyTokens({value: web3.toWei(0.5, "ether"), from: buyer});
  //   var balance = await token.balanceOf(buyer, {from: buyer});

  //   assert.isAbove(balance.valueOf(), buyersFirstBalance, "Buyer could not buy tokens in the following sale");
  // });

  // it('Should allow the owner to stop sale in an emergency', async function() {
  //   var sale;
  //   var owner = accounts[0];

  //   sale = await MetaFusionSale.deployed();

  //   var halt = await sale.stopICO({from: owner});
    
  //   // This sets an allowance of 100,000,000.00000 tokens for the sale to sell (up to all the tokens) 
  //   var result = await sale.hasHalted({from: owner});

  //   assert.equal(result.valueOf(), true, "Sale was not halted by owner");
  // });

  // it('Should not allow the owner to withdraw funds after stopping in emergency', async function() {
  //   var sale;
  //   var token;
  //   var owner = accounts[0];

  //   var ownerStartingBalance = await getBalance(owner);

  //   sale = await MetaFusionSale.deployed();
  //   var withdraw = await sale.collectInvestment({from: owner});

  //   var ownerEndingBalance = await getBalance(owner);

  //   assert.equal(ownerStartingBalance.valueOf(), ownerEndingBalance.valueOf(), "Owner could withdraw after stopping sale");
  // });

  // it('Should allow buyer to withdraw funds after stopping in emergency', async function() {
  //   var sale;
  //   var token;
  //   var buyer = accounts[2];

  //   var ownerStartingBalance = await getBalance(buyer);

  //   sale = await MetaFusionSale.deployed();
  //   var withdraw = await sale.collectRefund({from: buyer});

  //   var ownerEndingBalance = await getBalance(buyer);

  //   assert.isAbove(ownerEndingBalance.valueOf(), ownerStartingBalance.valueOf(), "Buyer could not withdraw after stopping sale");
  // });
});
