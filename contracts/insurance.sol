pragma solidity ^0.5.0;

contract insurance{
    //struct to save info of customer and the policy
   struct person{
       uint salary;
       string adhar_no;
       uint no_policies;
   }
   struct policy{
       uint duration;
       uint premium;
       uint sdate;
       uint amount;
       uint count;
       //uint preduration;
      // uint typep;
   }
   struct claim{
       uint ramount;
       bytes32 hid;
       address payable person;
       uint pid;
   }

   event policyadded(uint id);
   event claimsubmitted(uint id);
   event balance(uint bal);
   uint public fraction_to_be_invested;
   address payable public company_account;
   uint public claimid;
   mapping (bytes32=>address) public hospitals;
   
   //mappins to save the policy holders
   mapping(address=>person) public p;
   mapping(address=>mapping(uint=>policy)) public po;
   mapping(uint=>claim) public claims;
  
  //modifiers for verification of transaction requests to the contract
   modifier verifyclaim(uint _amt,uint _identity){
       require(p[msg.sender].no_policies>0);
       require(po[msg.sender][_identity].amount>_amt);
       require(now-po[msg.sender][_identity].sdate<po[msg.sender][_identity].duration);
       _;
   }
   
   
    modifier verifypremium(uint _identity){
       require(msg.value == po[msg.sender][_identity].premium);
     _;  
   }
    modifier verifyhospital(bytes32  _hid,uint _cid,uint _amt){
        require(hospitals[_hid]==msg.sender);
        require(_hid==claims[_cid].hid);
        require(_amt==claims[_cid].ramount);
     _;  
   }
   modifier isinsurer{
       require(msg.sender==company_account);
       _;
   }
  
  
    constructor(uint _fraction)public{
          fraction_to_be_invested=_fraction;
          company_account=msg.sender;
          claimid=0;
    }
   //function to add policy into the contract
   function addapolicy(uint _salary,string memory _adhar_no,uint _premium,uint _amount,uint _duration/*,uint _preduration,uint _type*/)public returns(uint) {
       
       if(p[msg.sender].no_policies==0){
           p[msg.sender]=person(_salary,_adhar_no,1);
       }
       else{
           p[msg.sender]=person(_salary,_adhar_no,p[msg.sender].no_policies+1);
       }
       
       po[msg.sender][p[msg.sender].no_policies]=policy({duration:_duration*356*24*60*60,premium:_premium*1 ether,sdate:now,amount:_amount*1 ether,count:(_duration*12)/*_preduration,preduration:(_preduration*365)/12,typep:_type*/});
       emit policyadded(p[msg.sender].no_policies);
       return p[msg.sender].no_policies;
   }
   
   
   //function to claim the policy
   function claimpolicy(uint _amount,bytes32  _hospital,uint _identity) public verifyclaim(_amount,_identity)returns(uint){
       uint x=getclaimid();
        claims[x]=claim(_amount,_hospital,msg.sender,_identity);
        emit claimsubmitted(x);
        return x;
   }
   
   
   //for premium
   function paypremium(uint _identity) payable public verifypremium(_identity){
            po[msg.sender][_identity].count=po[msg.sender][_identity].count-1;
            company_account.transfer(msg.value*fraction_to_be_invested/100);
   }
   
   
   function confirmclaim(bytes32  _hid,uint _amt,uint _cid)public verifyhospital(_hid,_cid,_amt){
        claims[_cid].person.transfer(claims[_cid].ramount*1 ether);
        po[msg.sender][claims[_cid].pid].amount=po[msg.sender][claims[_cid].pid].amount-claims[_cid].ramount*1 ether;
        delete claims[_cid];
   }
   
   
   function getclaimid()private returns(uint){
       claimid=claimid+1;
       return claimid;
   }
   
    function addhospital(address _address,bytes32 _hid)public isinsurer{
        hospitals[_hid]=_address;
    }
    
   function addcapital()payable public isinsurer{}
   function getbalance()public isinsurer returns(uint){
      emit balance(address(this).balance);
      return address(this).balance;
   }
}