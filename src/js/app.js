App = {
  web3Provider: null,
  contracts: {},
  account:{},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    console.log(web3);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON("insurance.json", function(insurance) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.insurance = TruffleContract(insurance);
      // Connect provider to interact with contract
      App.contracts.insurance.setProvider(App.web3Provider);
    });
    console.log(App.contracts);
    return App.bindEvents();
  },

  bindEvents: function() {
    $("#balance").on('click', App.getBalance);
    $(".add-cap").submit(App.addCapital);
    $(".claim").submit(App.claimPolicy);
    $(".add").submit(App.addPolicy);
    $(".confirm").submit(App.confirmClaim);
    $(".add-hosp").submit(App.addHospital);
    $(".pay").submit(App.payPremium);
    $("a").on('click', function(){
      for (var i = $("a").length - 1; i >= 0; i--) {
        $("."+$("a")[i].id).css({'display':'none'});
      }
      $("."+$(this).attr("id")).css({'display':'block'});
    });
  },

  addPolicy: function(event) {
    event.preventDefault();
    web3.eth.getAccounts((err,res)=>{
      App.account=res[0];
      $("#account").html("Your account: "+App.account);
    });
    var salary=$("#sal").val();
    var adhar=$("#adhar").val();
    var policy=$("#policy").val().split(" ");
    var premium=policy[0].substr(0,policy[0].search("eth"));
    var amount=policy[1].substr(0,policy[1].search("eth"));
    var duration=policy[2].substr(0,policy[2].search("yr"));
    App.contracts.insurance.deployed().then((instance)=>{
       return instance.addapolicy(salary,adhar,premium,amount,duration,{from:App.account});
    }).then(result=>{
      alert("This is your insurance id: "+result.receipt.logs[0].data);
    });
  },

  getBalance: function(event) {
    event.preventDefault();
    web3.eth.getAccounts((err,res)=>{
      App.account=res[0];
      $("#account").html("Your account: "+App.account);
    });
    App.contracts.insurance.deployed().then((instance)=>{
       return instance.getbalance({from:App.account});
    }).then((result)=>{
      alert("the balance of contract is: "+web3.fromWei(parseInt(result.receipt.logs[0].data))+"ether");
    });
    
    //$(document).alert("Contract Balaance: "+res.args.bal+" ether");
      
  },

  addCapital: function(event){
    event.preventDefault();
    web3.eth.getAccounts((err,res)=>{
      App.account=res[0];
      $("#account").html("Your account: "+App.account);
    });
    App.contracts.insurance.deployed().then((instance)=>{
       return instance.addcapital({from:App.account,value:web3.toWei($("#renew").val(),'ether')});
    }).then(result=>{
      alert(result.tx);
    });
      
  },

  claimPolicy: function(event){
    event.preventDefault();
    web3.eth.getAccounts((err,res)=>{
      App.account=res[0];
      $("#account").html("Your account: "+App.account);
    });
    var amt=$("#amt").val();
    var hid=$("#claim-hid").val();
    var pid=$("#pid").val();
    App.contracts.insurance.deployed().then((instance)=>{
      return instance.claimpolicy(amt,hid,pid,{from:App.account});
    }).then(result=>{
      alert("Claim id,please give it to hospital to claim policy: "+result.receipt.logs[0].data);
    });
  },

  confirmClaim: function(evevnt){
    event.preventDefault();
    web3.eth.getAccounts((err,res)=>{
      App.account=res[0];
      $("#account").html("Your account: "+App.account);
    });
    var amt=$("#bill").val();
    var hid=$("#conf-hid").val();
    var cid=$("#cid").val();
    App.contracts.insurance.deployed().then((instance)=>{
      return instance.confirmclaim(hid,amt,cid,{from:App.account});
    }).then(result=>{
      alert("Claim confirmed");
    });

  },

  addHospital: function(event){
    event.preventDefault();
    web3.eth.getAccounts((err,res)=>{
      App.account=res[0];
      $("#account").html("Your account: "+App.account);
    });
    var hid=$("#new-hid").val();
    var add=$("#hadd").val();
    App.contracts.insurance.deployed().then(instance=>{
      instance.addhospital(add,web3.toHex(hid),{from:App.account});
    }).then(result=>{
        alert("hospital added");
    });

  },

  payPremium: function(event){
    event.preventDefault();
    web3.eth.getAccounts((err,res)=>{
      App.account=res[0];
      $("#account").html("Your account: "+App.account);
    });
    var pre=$("#pre").val();
    var pid=$("#ppid").val()
    App.contracts.insurance.deployed().then((instance)=>{
       return instance.paypremium(pid,{from:App.account,value:web3.toWei(pre,'ether')});
    }).then(result=>{
      alert("Premium paid");
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
