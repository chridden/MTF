// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metaFusionArtifact from '../../build/contracts/ERC20_mtf_allowance.json'
import metaFusionSaleArtifact from '../../build/contracts/SALE_mtf.json'
import metaFusionSale2Artifact from '../../build/contracts/second_sale.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
const MetaFusion = contract(metaFusionArtifact);
const Sale = contract(metaFusionSaleArtifact);
const Sale2 = contract(metaFusionSale2Artifact);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

var price; 

const App = {
  start: function () {
    const self = this

    // Bootstrap the MetaCoin abstraction for Use.
    MetaFusion.setProvider(web3.currentProvider);
    Sale.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]

      self.refreshBalance();
      self.refreshAllowance();
      self.refreshSaleAllowance();
      self.refreshPrice();
      self.refreshEnded();
      self.refreshRefundable();
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  collectCommission: function () {
    const self = this

    this.setStatus('Initiating transaction... (please wait)')

    let sale
    Sale.deployed().then(function (instance) {
      sale = instance
      return sale.collectCommission({from: account});
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshBalance();
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  },

  refreshBalance: function () {
    const self = this

    let meta
    MetaFusion.deployed().then(function (instance) {
      meta = instance
      return meta.balanceOf.call(account, { from: account })
    }).then(function (value) {
      const balanceElement = document.getElementById('balance');

      var balance = convertPickToJacks(value.valueOf())

      balanceElement.innerHTML = addCommas(balance);
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  refreshPrice: function () {
    const self = this

    let sale
    Sale.deployed().then(function (instance) {
      sale = instance
      return sale.getPrice.call({ from: account })
    }).then(function (value) {
      const priceElement = document.getElementById('tokenPrice');
      price = convertJackToPicks(web3.fromWei(value.valueOf(), "ether"));
      priceElement.innerHTML = price;

      return sale.startTime.call({ from: account })
    }).then(function (value) {
      const startElement = document.getElementById('start_time');
      var date = parseInt(value.valueOf());
      date = date * 1000;
      startElement.innerHTML = new Date(date);
      return sale.endTime.call({ from: account })
    }).then(function (value) {
      const endElement = document.getElementById('end_time');
      var date = parseInt(value.valueOf());
      date = date * 1000;
      endElement.innerHTML = new Date(date);
      return sale.owner.call({ from: account })
    }).then(function (value) {
      const saleElement = document.getElementById('sale_owner');
      saleElement.innerHTML = value.valueOf();
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  approveAndCall: function () {
    const self = this

    const amount = convertJackToPicks(parseInt(document.getElementById('call_amount').value));
    const spender = document.getElementById('call_spender').value

    this.setStatus('Initiating transaction... (please wait)')

    let meta
    MetaFusion.deployed().then(function (instance) {
      meta = instance
      return meta.approveAndCall(spender, amount, { from: account })
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshAllowance();
      self.refreshSaleAllowance();
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  },

  sendCoin: function () {
    const self = this

    const amount = convertJackToPicks(parseInt(document.getElementById('amount').value));
    const receiver = document.getElementById('receiver').value

    this.setStatus('Initiating transaction... (please wait)')

    let meta
    MetaFusion.deployed().then(function (instance) {
      meta = instance
      return meta.transfer(receiver, amount, { from: account })
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshBalance()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  },

  withdraw: function () {
    const self = this

    this.setStatus('Initiating transaction... (please wait)')

    let sale
    Sale.deployed().then(function (instance) {
      sale = instance
      return sale.collectInvestment({from: account});
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshBalance();
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  },

  buyTokens: function () {
    const self = this

    var amount = parseFloat(document.getElementById('amount').value);

    var amount = amount * price;
    amount = web3.toWei(amount, "ether");

    this.setStatus('Initiating transaction... (please wait)')

    let sale
    Sale.deployed().then(function (instance) {
      sale = instance
      return sale.buyTokens({from: account, value: amount});
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshBalance();
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  },

  approve: function () {
    const self = this

    const amount = convertJackToPicks(parseInt(document.getElementById('app_amount').value));
    const spender = document.getElementById('app_spender').value

    this.setStatus('Initiating transaction... (please wait)')

    let meta
    MetaFusion.deployed().then(function (instance) {
      meta = instance
      return meta.approve(spender, amount, { from: account })
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshAllowance()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  },

  refreshAllowance: function () {
    const self = this

    var owner = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
    var spender = account;

    let meta
    MetaFusion.deployed().then(function (instance) {
      meta = instance
      return meta.allowanceOf.call(owner, spender, { from: account })
    }).then(function (value) {
      const allowanceElement = document.getElementById('allowance')
      allowanceElement.innerHTML = convertPickToJacks(value.valueOf());
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  refreshSaleAllowance: function () {
    const self = this

    var owner = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
    var spender = account;

    let sale
    Sale.deployed().then(function (instance) {
      sale = instance
      return sale.allowanceOf.call({ from: account })
    }).then(function (value) {
      const allowanceElement = document.getElementById('saleAllowance')

      var sale_allowance = convertPickToJacks(value.valueOf());

      allowanceElement.innerHTML = addCommas(sale_allowance);
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  refreshRefundable: function () {
    const self = this

    let sale
    Sale.deployed().then(function (instance) {
      sale = instance
      return sale.refundAvailable.call({ from: account })
    }).then(function (value) {
      const refundElement = document.getElementById('refundable');
      refundElement.innerHTML = value.valueOf();
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  stopSale: function () {
    const self = this

    let sale
    Sale.deployed().then(function (instance) {
      sale = instance
      return sale.stopICO({ from: account })
    }).then(function (value) {
      self.refreshEnded();
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  refreshEnded: function () {
    const self = this

    let sale
    Sale.deployed().then(function (instance) {
      sale = instance
      return sale.halted.call({ from: account })
    }).then(function (value) {
      const endedElement = document.getElementById('sale_halted');
      endedElement.innerHTML = value.valueOf();   
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  collectRefund: function () {
    const self = this

    let sale
    Sale.deployed().then(function (instance) {
      sale = instance
      return sale.collectRefund({ from: account })
    }).then(function () {
      self.refreshBalance();
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  sendFrom: function () {
    const self = this

    const amount = parseInt(document.getElementById('from_amount').value)
    const receiver = document.getElementById('from_receiver').value
    const from = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';

    this.setStatus('Initiating transaction... (please wait)')

    let meta
    MetaFusion.deployed().then(function (instance) {
      meta = instance
      return meta.transferFrom(from, receiver, amount, { from: account })
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshAllowance()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  }
}

function convertJackToPicks(jacks){
  return jacks * 100000;
}

function convertPickToJacks(picks){
  return picks / 100000;
}

// Adds commas to large numbers such as total supply
function addCommas(str) {
    var parts = (str + "").split("."),
        main = parts[0],
        len = main.length,
        output = "",
        first = main.charAt(0),
        i;

    if (first === '-') {
        main = main.slice(1);
        len = main.length;    
    } else {
        first = "";
    }
    i = len - 1;
    while(i >= 0) {
        output = main.charAt(i) + output;
        if ((len - i) % 3 === 0 && i > 0) {
            output = "," + output;
        }
        --i;
    }
    // put sign back
    output = first + output;
    // put decimal part back
    if (parts.length > 1) {
        output += "." + parts[1];
    }
    return output;
}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  }

  App.start()
})
