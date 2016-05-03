var test = require('tape')
var Ledger = require('../index')

var ledger = new Ledger()
var address = 'testaddr'
var address2 = 'test2'
test('init',function(t){
  ledger.init()
  t.end()
})

test('generate',function(t){
  var tx = ledger.generate(address,100)
  console.log(tx)
  t.end()
})
test('findOutputs',function(t){
  var outputs = ledger.findOutputs(address)
  console.log(outputs)
  t.end()
})
test('balance',function(t){
  var bal = ledger.balance(address)
  console.log(bal)
  t.end()
})
test('transfer',function(t){
  var tx = ledger.transfer(address,address2,50)
  var bal1 = ledger.balance(address)
  var bal2 = ledger.balance(address2)
  console.log(tx,bal1,bal2)
  t.end()
})

test.onFinish(function(){
  // console.log(ledger.transactions)
})
