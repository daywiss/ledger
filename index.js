var EventEmitter = require('events')
var util = require('util')
var rack = require('hat').rack()
var Promise = require('bluebird')

util.inherits(Ledger,EventEmitter)

var generator='generator'

function Ledger(){
  this.count = 0
  //transaction list
  this.transactions = []
  //cache of addresses
  this.addresses = {}
}
Ledger.prototype.generate = function(to,amt){
  return this.transfer(generator,to,amt,{
    description:'generated'
  })
}
Ledger.prototype.init= function(transactions){
  var tx = null
  transactions = transactions || this.transactions
  for(var i in transactions){
    for(var addr in transactions[i].output){
      addresses[addr] = transactions[i]
    }
  }
}
Ledger.prototype.checkCache = function(addr,txid){
  var cache = this.addresses
  if(cache[addr] == null) return false
  return cache[addr][txid] 
}

//inputs hash transaction id with user address 
//outputs hash user address with amount 
Ledger.prototype.findOutputs = function(addr){
  var transactions = this.transactions
  var cache = this.addresses
  var outputs={}
  var inputs = {}
  for(var i in transactions){
    var tx = transactions[i]
    //find all references to this address in transactions
    if(tx.outputs[addr]){
      outputs[tx.id] = tx.outputs[addr]
      //if(this.checkCache(addr,tx.id) == null){
      //  //save potential output
      //  outputs[tx.id] = tx.outputs[addr]
      //}
    }
    //record if those outputs hve been used in another input
    for(var txin in tx.inputs){
      var inaddress = tx.inputs[txin]
      if(inaddress == addr){
        //mark transaction as used
        inputs[txin]= addr
      }
    }
  }
  var result = []
  for(var id in outputs){
    if(inputs[id] == null){
      result.push(outputs[id])
    }
  }
  return result
}

Ledger.prototype.balance = function(addr){
  var outputs = this.findOutputs(addr)
  var bal = 0
  var inputs = {}
  for(var i in outputs){
    bal += outputs[i]
    inputs[i] = addr
  }
  return {
    balance:bal
    ,inputs:inputs
  }

}

Ledger.prototype.transfer = function(from,to,amt,meta){
  var balance = null
  var inputs = null
  if(from === generator){
    balance = amt
    inputs={[generator]:amt}
  }else{
    var res = this.balance(from)
    balance = res.balance 
    inputs = res.inputs
  }
  if(amt <= 0) throw 'amount to transfer must be > 0'
  if(amt > balance.balance) throw from + ' does not have enough funds to transfer'
  var transaction = {inputs:{},outputs:{}}
  transaction.id = this.transactions.length
  transaction.outputs[from] = balance - amt
  transaction.outputs[to] = amt
  transaction.inputs = inputs
  transaction.meta = meta
  this.transactions.push(transaction)
  return transaction
}

// Ledger.prototype.transfer = Promise.method(function(fromid,toid,amt){
//   var fromaddr = this.address(fromid)
//   var toaddr = this.address(toid)
//   if(amt > fromaddr.balance) throw fromid + ' does not have enough funds to transfer'
//   var transaction = {
//     id:rack()
//     ,input:fromaddr.output
//     ,to:toid
//     ,amount:amt
//     ,input:
//   }
// })


module.exports = Ledger
