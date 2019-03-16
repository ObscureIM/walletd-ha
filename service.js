'use strict'

const TurtleService = require('./')
const util = require('util')

var wallet = new TurtleService({
  appName: 'default', // This defines an application name used to store some settings.
  pollingInterval: 10, // Check to make sure that turtle-service is alive every x seconds
  maxPollingFailures: 3, // After the polling checks fail x times, report the turtle-service process down
  saveInterval: 10, // issue an automatic save request every x seconds as long as the wallet is synced
  scanInterval: 5, // scan the wallet for new transactions every x seconds as long as the wallet is synced
  timeout: 2000, // consider RPC calls timed out after x milliseconds
  path: './obscure-service', // the path to the turtle-service binary
  enableWebSocket: true, // enable the WebSocket server at bindPort + 1

  // Standard turtle-service options start here
  config: false, // the path to a turtle-service config file -- if you so choose
  bindAddress: '127.0.0.1', // The IP address that turtle-service will bind to
  bindPort: 10071, // The port that turtle-service will bind to
  rpcPassword: 'password', // You really should use an RPC password
  rpcLegacySecurity: false, // Turning this to true, removes the requirement for a RPC password, either rpcPassword or rpcLegacySecurity MUST be set
  containerFile: './container.walletd', // The path to your turtle-service container file
  containerPassword: 'password', // The password to your turtle-service container file
  logFile: false, // The path to the log file you would like turtle-service to keep
  logLevel: 4, // The log level to use with turtle-service
  syncFromZero: false, // If set to true, will tell turtle-service to always sync the container from zero.
  daemonRpcAddress: '0.0.0.0', // Daemon RPC IP Address (if your daemon doesn't use 127.0.0.1 or 0.0.0.0 -- you really need to change this)
  daemonRpcPort: 11002, // Daemon RPC port

  // RPC API default values
  defaultMixin: 0, // the default mixin to use for transactions
  defaultFee: 0.1, // the default transaction fee for transactions
  defaultBlockCount: 1, // the default number of blocks when blockCount is required
  decimalDivisor: 100000000, // Currency has many decimal places?
  defaultFirstBlockIndex: 1, // the default first block index we will use when it is required
  defaultUnlockTime: 0, // the default unlockTime for transactions
  defaultFusionThreshold: 10000000, // the default fusionThreshold for fusion transactions
})


function log (message) {
  console.log(util.format('%s: %s', (new Date()).toUTCString(), message))
}

wallet.on('start', (args) => {
  log(util.format('turtle-service has started... %s', args))
})

wallet.on('error', (err) => {
  log(util.format('[ERROR]: %s', err))
})

wallet.on('info', (info) => {
  log(util.format('[INFO]: %s', info))
})

wallet.on('warning', (warn) => {
  log(util.format('[WARNING]: %s', warn))
})

wallet.on('status', (status) => {
  log(util.format('[STATUS] Synced %s out of %s blocks (%s%)', status.blockCount, status.knownBlockCount, Math.round((status.blockCount / status.knownBlockCount) * 100, 1)))
})

wallet.on('synced', () => {
  log('[WALLET] Wallet is synchronized')
})

wallet.on('save', () => {
  log('[WALLET] Wallet saved')
})

wallet.on('down', () => {
  log('[ERROR] turtle-service is not responding... stopping process...')
  wallet.stop()
})

wallet.on('scan', (fromBlock, toBlock) => {
  log(util.format('[WALLET] Scanning block %s to %s', fromBlock, toBlock))
})

wallet.on('transaction', (transaction) => {
  log(util.format('[WALLET] %s transaction %s %s in the amount of %s', (transaction.inbound) ? 'incoming' : 'outgoing', (transaction.inbound) ? 'to' : 'from', transaction.address, transaction.amount))
})

wallet.on('data', (data) => {

})

wallet.on('close', (exitcode) => {
  log(util.format('[WARNING] turtle-service has closed (exitcode: %s)... restarting process...', exitcode))
  wallet.start()
})

wallet.start()
