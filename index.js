
/// botism node v1.2

require('dotenv').config();
const WebSocket = require('ws')
const rp = require('request-promise')
const _ = require('lodash')
const api = require('./api.js').start()
const db = require('./db.js')
const utils = require('./utils.js')

console.log('+++ starting botism node at ' + new Date())

db.start()



// db.drop('strat1')
//
// db.drop('strat2')
db.drop('log1')
db.drop('log2')
// //
db.drop('trades1')
db.drop('trades2')

return

// db.truncate('log1')
// db.truncate('log2')
// db.truncate('trades1')
// db.truncate('trades2')
// db.truncate('strat1')
// db.truncate('strat2')
//
// return

let nodelets = []
api.get('/nodelets', (req, res) => res.send(nodelets))

setTimeout(()=>{newNodelet('dbbacc2', process.env['KEY'+(nodelets.length+1)], process.env['SEC'+(nodelets.length+1)])},2000)
setTimeout(()=>{newNodelet('dbbacc2', process.env['KEY'+(nodelets.length+1)], process.env['SEC'+(nodelets.length+1)])},10000)

const newNodelet = (name, key, secret) => {

    console.log('starting nodelet, name: ' + name)



    let nodelet = {
        id: nodelets.length + 1,
        running: false,
        name: name,
        pnlAll: 0,
        startingEquity: 0,
        currentBid: 0,
        currentSize: 0,
        currentEntry: 0,
        currentEquity: 0,
        lastEquity: 0,
        lastCloseSize: 0,
        closeID: 0,
        resetCount: 0,
        lastBid: 0,
        info: {info: 'hi'},

        log: [],
        trades: [],
        strat: [],
        info: []

    }
    nodelets.push(nodelet)

    // db.createAll(nodelet.id)

    db.add('strat'+nodelet.id,
        'name, symbol, tf, tpPercent, stopPercent, size, scalePercent, scaleQty, scaleWeight, trigger, scaleChase'
        ,[
            'stratname',
            'XBTUSD',
            1,
            0.36,
            4.1,
            5,
            4,
            20,
            3,
            'xdiv',
            true
        ])



    setTimeout(()=>{
        db.get('log'+nodelet.id, (log)=>{
                    if (log) {
                        nodelet.log = log
                    }
                })

        db.get('trades'+nodelet.id, (trades)=>{
            if (trades) {
                nodelet.trades = trades
            }
        })

        db.get('strat'+nodelet.id, (strat)=>{
            if (strat) {
                nodelet.strat = strat
            }
        })

        // nodelet.log = db.get('log'+nodelet.id)
        // nodelet.trades = db.get('trades'+nodelet.id)
        // nodelet.strat = db.get('strat'+nodelet.id)
    },2000)

    utils.loop(5000, ()=>{


        db.update('strat'+nodelet.id, 'size = \'' + new Date().getTime()+'\'')


    }, 2000)


    /// set data GET endpoints
    _.forEach(['strat', 'trades', 'log', 'info'], name =>
        api.get('/' + nodelet.id + '/' + name, (req, res) => res.send(nodelet[name])))

    ///
    const log = s => {
        nodelet.log = [[s, new Date().getTime()], ...nodelet.log]
        db.add('log'+nodelet.id, 'text, time', [s, new Date().getTime() ])


        console.log('log: ')
        console.log(JSON.stringify(nodelet.log))
    }

    log('starting nodelet, name: ' + name)



    db.add('trades'+nodelet.id,
        'active, trigger, entryPrice, entrySize, tpPrice, stopPrice, startBalance, endingBalance, ' +
        'pnl, diff, resultType, resultMove, filled, startTime, endTime, endPrice, startStartEquity'
        ,[
        false,
        'xdiv',
        21,
        21,
        31,
        31,
        31,
        31.2,
        31,
        31,
        'tp',
        31,
        31,
        31,
        31,
        31,
        0.01
    ])

    let ws = null

    /// deribit ws
    const socketMessageListener = (msg) => {
        let msgg = JSON.parse(msg.data)

        if (!msgg.result) {
            return
        }

        // console.log(JSON.stringify(msgg))

        if (msgg.result.equity > 0) {
            console.log('equity: '+msgg.result.equity)
            //balance message
            nodelet.currentEquity = msgg.result.equity

            if (nodelet.startingEquity === 0 && nodelet.currentBid > 0 && nodelet.currentEquity > 0) {
                nodelet.startingEquity = nodelet.currentEquity
            }

            if (nodelet.lastEquity === 0) {
                nodelet.lastEquity = nodelet.currentEquity
            }

        } else if (msgg.result.total_profit_loss !== undefined) {
            //position message
            // console.log('size: '+msgg.result.size)
            nodelet.currentSize = msgg.result.size
            nodelet.currentEntry = msgg.result.average_price
        } else if (msgg.result.best_bid_price !== 0 && msgg.result.best_bid_price !== undefined && msgg.result.best_bid_price !== nodelet.currentBid) {
            //ticker message
            nodelet.currentBid = msgg.result.best_bid_price
            // console.log('new currentbid: ' + nodelet.currentBid)
        } else {
            // console.log('msg: '+JSON.stringify(msgg.result))
        }
    }
    const socketOpenListener = () => {
        console.log("deribit open")
        log('deribit websocket: [open(yellowgreen)]')
        _api_('deribit', 'public/auth',
            {
                //dbit2
                "grant_type": "client_credentials",
                "client_id": key,
                "client_secret": secret
            }
        )
        // api('deribit', 'subscribe',  {
        //     "channels": [
        //         "user.orders.btc_usd"
        //     ]
        // } )
    }
    const socketErrorListener = (e) => {
        log('deribit websocket: [error(orange)]: ' + JSON.stringify(e))
        errorCatcher('deribitWebsocket', e)
    }
    const socketCloseListener = (e) => {
        console.error('deribit close')
        log('deribit websocket: [close(brightred)] code: ' + (e&&e.code?e.code:'none') )

        if (e && e.code === 1000) {
            return
        }

        log('deribit websocket: [starting..(brightred)]')

        ws = new WebSocket('wss://www.deribit.com/ws/api/v2')
        ws.addEventListener('open', socketOpenListener)
        ws.addEventListener('message', socketMessageListener)
        ws.addEventListener('close', socketCloseListener)
        ws.addEventListener('error', socketErrorListener)
    }
    socketCloseListener()


    api.post('/' + nodelet.id + '/run', function (request, response) {
        // console.log('request: '+request.body.namee);

        log('[run(greenyellow)]')

        nodelet.running = true

        nodelet.strat.running = true

        if (nodelet.running) {
            socketCloseListener()
        }

    })

    api.post('/' + nodelet.id + '/stop', function (request, response) {
        // console.log('request: '+request.body.namee);

        log('[stop(orangered)]')

        nodelet.running = false

        nodelet.strat.running = false

        if (nodelet.running) {
            socketCloseListener()
        } else {
            ws.close(1000)
        }

    })

    api.post('/' + nodelet.id + '/strat', function (request, response) {
        // console.log('request: '+request.body.namee);

        log('[strat updated(yellow)]')

        nodelet.strat = request.body.strat

        console.log('new strat: ')

        console.log(nodelet.strat)


    })



    /// universal method for exchange api calls
    const _api_ = (exchange, path, params) => {
        if (exchange === 'deribit') {

            if (ws.readyState === 0) {return}

            ws.send(JSON.stringify({
                "jsonrpc": "2.0",
                "id": 7710,
                "method": path,
                "params": params
            }))
        } else if (exchange === 'bitmex') {
            //do bitmex api calls
        }
    }


    const checkPriceLoop = utils.loop(300, () => {

        if (!nodelet.running) {
            return
        }

        _api_('deribit', 'public/ticker', {
            "instrument_name": "BTC-PERPETUAL"
        })
    }, 500)

    const checkPositionLoop = utils.loop(300, () => {

        if (!nodelet.running) {
            return
        }

        _api_('deribit', 'private/get_position', {
            "instrument_name": "BTC-PERPETUAL"
        })
    }, 1000)

    const checkEquityLoop = utils.loop(300, () => {

        if (!nodelet.running) {
            return
        }

        _api_('deribit', 'private/get_account_summary', {
            "currency": "BTC",
            "extended": true
        })

        let t = nodelet.trades[0]

        if (!t) {
            return
        }

        nodelet.trades[0].endBalance = nodelet.currentEquity
        nodelet.trades[0].pnl = (t.endBalance - t.startBalance).toFixed(8)

        //fix accuracy after
        if (t.active) {

            if (nodelet.currentEntry > 0) {
                nodelet.trades[0].entryPrice = nodelet.currentEntry
            }
        }

        t.resultMove = ((((nodelet.trades[0].endPrice || nodelet.currentBid) - nodelet.currentEntry) / (nodelet.currentEntry)) * 100).toFixed(2)

        t.diff = (((t.endBalance - t.startBalance) / t.startBalance) * 100).toFixed(2) + "%  ($" + ((t.endBalance - t.startBalance) * nodelet.currentBid).toFixed(2) + ")"


        // db.update('trades'+nodelet.id,
        //     'endBalance=' + nodelet.trades[0].endBalance + ', ' +
        //     'pnl=' + nodelet.trades[0].pnl + ', ' +
        //     'entryPrice=' + nodelet.trades[0].entryPrice + ', ' +
        //     'resultMove=' + nodelet.trades[0].resultMove + ', ' +
        //     'diff=' + nodelet.trades[0].diff
        // )

    }, 2000)

    const triggerLoop = utils.loop(10000, () => {

        // console.log('nodelet ' + nodelet.id + ' triggerloop, balance: ' + nodelet.currentEquity)

        // log('triglooop')

        if (!nodelet.running) {
            return
        }

        if (nodelet.trades[0] && nodelet.trades[0].active) {
            return
        }

        let trigger = false

        if (nodelet.strat.trigger === 'xdiv') {
            trigger = xdiv()
        }


        // log('[nodelet ' + nodelet.id + ' triggerloop..(' + '#46ffc7' + ')]')

        return

        // pick trigger function
        // let trigger =
        //     xdiv()
        // fish()

        // console.log('trigger loop.  current bid: ' + nodelet.currentBid + 'current equity: ' + nodelet.currentEquity)


        if (trigger) {

            // let size = Math.abs(strat_.size)
            //
            //
            // if (trades_[0] && trades_[0].resultType==='tp' && trades_[0].resultType==='tp' && size <40) {
            //
            //     strat_.size = Math.abs(strat_.size) + 5
            //
            //     log('last two trades were winners, upping position lev to ' + size)
            // }

            newTrade('xdiv')
        }
    })

    let bars = []

    const getBarsLoop = utils.loop(1000, () => {

        if (!nodelet.running) {
            return
        }

        let url =
            // 'http://localhost:8080/' +
            'https://mysterious-meadow-37959.herokuapp.com/' + nodelet.strat.symbol + '/' + (nodelet.strat.tf === 1 ? 'm1' : 'h1')

        rp(url)
            .then(data => {
                bars = JSON.parse(data)

                // console.log('lastbar: ' + JSON.stringify(nodelet.bars[nodelet.bars.length-1]))

                checkErrorHasPassed('getBarsLoop')
            })
            .catch(e => {
                errorCatcher('getBarsLoop', e)

                console.log(e)

            })
    })

    const setCloseLoop = utils.loop(1000, () => {

        if (!nodelet.running) {
            return
        }

        if (!nodelet.trades[0] || !nodelet.trades[0].active) {
            return
        }

        if (nodelet.currentSize === 0 && nodelet.lastCloseSize !== 0) {
            console.log("pos to 0, cancel all and reset!")

            log(('trade id' + nodelet.trades[0].id + " has finished!"))

            nodelet.trades[0].endTime = new Date().getTime()


            setTimeout(() => {


                let dec = nodelet.lastEquity - nodelet.currentEquity

                let result = ((dec / nodelet.lastEquity) * 100)

                nodelet.trades[0].endPrice = nodelet.currentBid

                nodelet.trades[0].endingBalance = nodelet.currentEquity

                log('result: [' + (result < 0 ? ('+' + Math.abs(result).toFixed(2)) : '-' + result.toFixed(2)) + '%(' + (result < 0 ? 'yellowgreen' : 'orangered') + ')]')

                nodelet.lastEquity = nodelet.currentEquity
            }, 700)

            nodelet.resetCount = 0

            _api_('deribit', 'private/cancel_all', {})

            nodelet.lastCloseSize = 0

            nodelet.trades[0].resultType = nodelet.trades[0].pnl > 0 ? 'tp' : 'stop'


            nodelet.trades[0].active = false


        } else if (Math.abs(nodelet.currentSize) > Math.abs(nodelet.lastCloseSize)) {

            // console.log(currentSize + " size different, reset close")

            let tpPrice = nodelet.currentEntry * (1 + ((nodelet.strat.tpPercent / 100) * (nodelet.currentSize > 0 ? 1 : -1)))
            let stopPrice = nodelet.currentBid * (nodelet.strat.size > 0 ? (1 - (nodelet.strat.stopPercent / 100)) : (1 + (nodelet.strat.stopPercent / 100)))

            if (nodelet.closeID === 0) {
                // console.log("no closeid, place new")

                let msg =
                    {
                        "jsonrpc": "2.0",
                        "id": 5275,
                        "method": nodelet.currentSize < 0 ? "private/buy" : "private/sell",
                        "params": {
                            "instrument_name": "BTC-PERPETUAL",
                            "amount": Math.abs(nodelet.currentSize),
                            "type": "limit",
                            "price": tpPrice,
                            "label": "close",
                            "trigger": 'index_price',
                            "post_only": true,
                            "reduce_only": true
                        }
                    }
                ws.send(JSON.stringify(msg))


            } else {
                console.log('update close id ' + nodelet.closeID)

                let msg =
                    {
                        "jsonrpc": "2.0",
                        "id": 5275,
                        "method": "private/edit",
                        "params": {
                            "order_id": nodelet.closeID,
                            "amount": nodelet.currentSize,
                            "price": nodelet.tpPrice,
                        }
                    }
                ws.send(JSON.stringify(msg))

            }

            //size different, reset closes

            nodelet.lastCloseSize = nodelet.currentSize

            nodelet.trades[0].filled = nodelet.currentSize


            nodelet.trades[0].tpPrice = tpPrice


            nodelet.trades[0].stopPrice = stopPrice

        }
    })


    function newTrade(trigger, stopp) {
        console.log("NEW TRADE! nodelet: " + nodelet.id)
        setTimeout(() => {
            log(nodelet.id + ' [new trade(yellow)] - id: ' + ((nodelet.trades[0] ? nodelet.trades[0].id : 1))
                + ", equity: " + nodelet.currentEquity + ' ($' + (nodelet.currentEquity * nodelet.currentBid).toFixed(2) + ')'
                + ', trigger: ' + trigger
                + ", price: " + nodelet.currentBid
            )
        }, 500)

        // return

        if (nodelet.strat.scaleChase) {


            let entryloop = setInterval(() => {
                console.log('entryloop curentsize ')
                if (nodelet.currentSize === 0) {

                    if (nodelet.lastBid === 0) {
                        nodelet.lastBid = nodelet.currentBid
                    }

                    if (nodelet.currentBid !== 0 && nodelet.currentBid === nodelet.lastBid) {
                        return
                    }

                    nodelet.lastBid = nodelet.currentBid

                    // log('reset entry orders')
                    _api_('deribit', 'private/cancel_all', {})
                    startTrades('reset')
                } else {
                    log('starting to get filled..')
                    clearInterval(entryloop)

                }

            }, 3000)
        } else {
            startTrades()
        }


        //todo fix this doublecode
        //
        let stopPrice = stopp || (nodelet.currentBid * (1 + ((nodelet.strat.stopPercent / 100) * (nodelet.strat.size < 0 ? 1 : -1))))
        //
        let sizeLev = Math.ceil((nodelet.strat.size * (nodelet.currentEquity * nodelet.currentBid)) / 10) * 10

        let tpPrice = nodelet.currentBid * (1 + ((nodelet.strat.tpPercent / 100) * (nodelet.currentSize > 0 ? 1 : -1)))

        trade = {
            id: (nodelet.trades[0] ? nodelet.trades[0].id : 0) + 1,
            active: true,
            trigger: trigger,
            entryPrice: nodelet.currentBid,
            entrySize: sizeLev,
            tpPrice: tpPrice,
            stopPrice: stopPrice,

            startBalance: nodelet.currentEquity,
            endingBalance: nodelet.currentEquity,
            pnl: 0,
            diff: 0,
            resultType: 'in progress',
            resultMove: 0,
            filled: 0,
            startTime: new Date().getTime(),
            startPrice: nodelet.currentBid,
            endTime: 0,
            endPrice: 0,
            startStartEquity: nodelet.startingEquity,
        }

        if (!nodelet.trades[0]) {
            trade.id = 1
            nodelet.trades = [trade]
        } else {
            nodelet.trades = [trade].concat(nodelet.trades)
        }

    }


    const startTrades = (reset) => {

        console.log('startrades ')


        let side = nodelet.strat.size > 0

        let numberOfOrders = nodelet.strat.scaleQty

        let prices = []


        let upperPrice
        let lowerPrice

        if (side) {
            upperPrice = nodelet.currentBid * 1.0015
            lowerPrice = upperPrice * (1 - (nodelet.strat.scalePercent / 100))
        } else {
            lowerPrice = nodelet.currentBid * .9985
            upperPrice = lowerPrice * (1 + (nodelet.strat.scalePercent / 100))
        }

        console.log("upperprice: " + upperPrice + " lowerprice: " + lowerPrice)

        let totalSize = Math.ceil((nodelet.strat.size * (nodelet.currentEquity * nodelet.currentBid)) / 10) * 10

        let rangeAmt = upperPrice - lowerPrice

        let steps = rangeAmt / (numberOfOrders - 1)

        for (let i = 0; i < numberOfOrders; i++) {
            if (i === 0) {
                prices.push(upperPrice).toFixed(2)
            } else if (i === numberOfOrders - 1) {
                prices.push(lowerPrice).toFixed(2)
            } else {

                let bd = parseFloat(lowerPrice) + (steps * i)

                // bd = Formatter.getpoint5round(bd).doubleValue();


                prices.push(bd.toFixed(2))
            }
        }
        prices.sort(function (a, b) {
            return a - b
        })

        prices = prices.reverse()

        // console.log("prices: ")
        // console.log(prices)


        let distributedTotal = []

        let allSum = 0

        let singleOrderAmt

        let amounts = []

        if (nodelet.strat.scaleWeight === 0) {
            singleOrderAmt = totalSize / numberOfOrders

            singleOrderAmt = singleOrderAmt.toFixed(0)

            for (let i = 0; i < numberOfOrders; i++) {
                distributedTotal.push(singleOrderAmt)
            }
        } else {


            let pricePointPercentages = []

            // Min and max percentage of the amount allocated per price point
            let minPercentage = 0.09
//            System.out.println("minPercent: " + minPercentage);
            let maxPercentage = 0.04 * (1.2 + (nodelet.strat.scaleWeight))
//            System.out.println("macxPercent: " + maxPercentage);


            for (let i = 0; i < numberOfOrders; i++) {
                pricePointPercentages.push((minPercentage + (i * (maxPercentage - minPercentage)) / (numberOfOrders + 1)))
            }


            let leftover = 0
            let distributionSum = 0
            pricePointPercentages.forEach((d) => {
                distributionSum += d
            })

            for (let i = 0; i < pricePointPercentages.length; i++) {

                let val = (pricePointPercentages[i] * totalSize) / distributionSum + leftover


                distributedTotal.push(parseInt(val.toFixed(0)))

            }

            distributedTotal.forEach((d) => allSum += d)

            if (!side) {
                distributedTotal.reverse()
            }


        }


        let trades = []

        for (let i = 0; i < numberOfOrders; i++) {
            trades.push({
                price: prices[i],
                size: Math.ceil(distributedTotal[i] / 10) * 10,
                side: side
            })
        }

        // console.log(trades)

        if (nodelet.log[0][0].includes('reset entries attempt')) {

        }


        if (reset) {

            if (nodelet.resetCount === 0) {
                nodelet.resetCount++
                log('entries attempt #' + nodelet.resetCount + ', scaling ' + (trades[0].side ? '[long(yellowgreen)]' : '[short(orangered)]') + ' from ' + trades[0].price.toFixed(1) + ' to ' + (trades[trades.length - 1]).price.toFixed(1) + ' (' + nodelet.strat.scalePercent + '%)'

                    + ', total size: ' + totalSize + ', orders: ' + numberOfOrders + ', weight: ' + nodelet.strat.scaleWeight)
                // log('entries attempt #' + resetCount + ', scale range ' + upperPrice + ' to ' + lowerPrice )
            } else {
                nodelet.resetCount++

                if (nodelet.log[0][0].includes('entries attempt')) {
                    nodelet.log[0] = [('entries attempt #' + nodelet.resetCount + ', scaling ' + (trades[0].side ? '[long(yellowgreen)]' : '[short(orangered)]') + ' from ' + trades[0].price.toFixed(1) + ' to ' + (trades[trades.length - 1]).price.toFixed(1) + ' (' + nodelet.strat.scalePercent + '%)'

                        + ', total size: ' + totalSize + ', orders: ' + numberOfOrders + ', weight: ' + nodelet.strat.scaleWeight), new Date().getTime()]
                } else {
                    log('entries attempt #' + nodelet.resetCount + ', scaling ' + (trades[0].side ? '[long(yellowgreen)]' : '[short(orangered)]') + ' from ' + trades[0].price.toFixed(1) + ' to ' + (trades[trades.length - 1]).price.toFixed(1) + ' (' + nodelet.strat.scalePercent + '%)'

                        + ', total size: ' + totalSize + ', orders: ' + numberOfOrders + ', weight: ' + nodelet.strat.scaleWeight)
                }

                // log_[0] = ['reset entries attempt #' + resetCount + ', new scale range ' + upperPrice.toFixed(1) + ' to ' + lowerPrice.toFixed(1), new Date().getTime()]
            }


        } else {
            log('scaling ' + (trades[0].side ? '[long(yellowgreen)]' : '[short(orangered)]') + ' from ' + trades[0].price.toFixed(1) + ' to ' + (trades[trades.length - 1]).price.toFixed(1) + ' (' + nodelet.strat.scalePercent + '%)'

                + ', total size: ' + totalSize + ', orders: ' + numberOfOrders + ', weight: ' + nodelet.strat.scaleWeight)
        }


        //place trades (trade+stop+reduceTP)


        // console.log("stopprice " + stopPrice)

        trades.forEach((trade) => {

            console.log("place trade " + JSON.stringify(trade))


            _api_('deribit', side ? "private/buy" : "private/sell", {
                "instrument_name": "BTC-PERPETUAL",
                "amount": Math.abs(trade.size),
                "type": "limit",
                "price": trade.price,
                "label": "entry",
                "trigger": 'index_price',
                "post_only": true,
                "reduce_only": false
            })

            _api_('deribit', !side ? "private/buy" : "private/sell", {
                // 'access_token': oauth,
                "instrument_name": "BTC-PERPETUAL",
                "amount": Math.abs(trade.size),
                "type": "stop_market",
                // "price" : this.state.price,
                "stop_price": (nodelet.currentBid * (1 + ((nodelet.strat.stopPercent / 100) * (nodelet.strat.size < 0 ? 1 : -1)))),
                "label": "stop",
                "trigger": 'index_price',
                "reduce_only": true
            })

        })
//
    }


    let errors = {
        getBarsLoop: {
            active: false,
            count: 0,
            codes: [],
            start: null,
            end: null
        },
        fishLoop: {
            active: false,
            count: 0,
            codes: [],
            start: null,
            end: null
        }
    }

    const errorCatcher = (name, err) => {

        console.log('err: ' + JSON.stringify(err))

        let error_ = errors[name]

        if (!error_.active) {
            error_.start = new Date().getTime()
            error_.codes.push(err.statusCode || err.message)
            error_.active = true


            let es = ''
            error_.codes.forEach(s => es += '[' + s + '(orange)]')

            log('[error(red)] in ' + name + ', codes: ' + es + ' at: ' + (new Date(error_.start) + '').replace('Eastern Daylight Time', 'EST').replace('GMT-0400', ''))

        } else {
            error_.count++

            let codeExists = error_.codes.find(c => {
                return c === err.statusCode || c === err.message
            })
            if (!codeExists) {
                error_.codes.push(err.statusCode)
            }

            let found = nodelet.log.find(l => l[0].includes(name))
            if (found) {
                nodelet.log = nodelet.log.filter(item => item !== found)
                nodelet.log.unshift(found)

                let es = ''
                error_.codes.forEach(s => es += '[' + s + '(orange)]')

                let now = new Date().getTime()
                let start = error_.start

                nodelet.log[0][0] = '[error(red)] in ' + name + ', codes: ' + es + ', duration: ' + ((now - start) > 60000 * 60 ? ((now - start) / 1000 / 1000).toFixed(1) + ' minutes' : ((now - start) / 1000).toFixed(0) + ' seconds') + ', start: ' + ((new Date(error_.start) + '').replace('Eastern Daylight Time', 'EST').replace('GMT-0400', '')) + ', count: ' + error_.count

            }
        }
    }

    const checkErrorHasPassed = name => {
        if (errors[name].active) {

            console.log(name + " error fixed, back to normal at " + new Date().toLocaleString())

            log('the ' + name + ' error has stopped at ' + ((new Date() + '').replace('Eastern Daylight Time', 'EST').replace('GMT-0400', '')))

            errors[name].end = new Date().toLocaleString('UTC')
            errors[name].active = false
            errors[name].count = 0
            errors[name].codes = []
        }
    }


    let lastf90_ = 0
    let lastf88 = 0
    let lastf8 = 0
    let lastf28 = 0
    let lastf30 = 0
    let lastf38 = 0
    let lastf40 = 0
    let lastf48 = 0
    let lastf50 = 0
    let lastf58 = 0
    let lastf60 = 0
    let lastf68 = 0
    let lastf70 = 0
    let lastf78 = 0
    let lastf80 = 0

    let getRsx = (close) => {

        let src = close

        // console.log('close: ' + src)

        // let f1 = this._context.new_var();
        // let _f1 = 5
        // f1.set(_f1)
        // f1 = _f1
        //
        // return [f1]


        //
        //
        //
        //
        //
        // return [src.get(0)*2]
        //
        const length = 14
        const lvlob = 70
        const lvlos = 30
        const mid = 50
        const clampmax = 100
        const clampmin = 0
        //
        let f90_

        let f88

        f90_ = (lastf90_ === 0.0) ? 1.0 : (lastf88 <= lastf90_) ? lastf88 + 1 : lastf90_ + 1

        f88 = ((lastf90_ === 0.0) && (length - 1 >= 5) ? length - 1.0 : 5.0)


        let f8
        f8 = (src * 100)

        let f18
        f18 = 3.0 / (length + 2.0)

        let f20

        f20 = 1.0 - f18


        //
        let f10
        f10 = lastf8
        //
        let v8
        v8 = f8 - f10
        //
        //
        //
        let f28
        f28 = f20 * lastf28 + f18 * v8
        //
        let f30
        f30 = f18 * f28 + f20 * lastf30
        //
        let vC
        vC = f28 * 1.5 - f30 * 0.5

        let f38
        f38 = f20 * lastf38 + f18 * vC

        let f40
        f40 = f18 * f38 + f20 * lastf40

        // return [f40.get(0)]

        let v10
        v10 = f38 * 1.5 - f40 * 0.5

        let f48
        f48 = f20 * lastf48 + f18 * v10

        let f50
        f50 = f18 * f48 + f20 * lastf50

        let v14
        v14 = f48 * 1.5 - f50 * 0.5

        // return [v14.get(0)]

        let f58
        f58 = f20 * lastf58 + f18 * Math.abs(v8)

        let f60
        f60 = f18 * f58 + f20 * lastf60

        let v18
        v18 = f58 * 1.5 - f60 * 0.5

        let f68
        f68 = f20 * lastf68 + f18 * v18

        let f70
        f70 = f18 * f68 + f20 * lastf70

        // return [f70.get(0)]
        //
        let v1C
        v1C = f68 * 1.5 - f70 * 0.5

        let f78
        f78 = f20 * lastf78 + f18 * v1C

        let f80
        f80 = f18 * f78 + f20 * lastf80

        let v20
        v20 = f78 * 1.5 - f80 * 0.5

        // return [v20.get(0)]


        let f0
        f0 = ((f88 >= f90_) && (f8 !== f10)) ? 0.0 : 0.0

        // return [f0.get(0)]

        let f90
        f90 = 6
        // f90.set(((f88.get(0) === f90_.get(0)) && (f0.get(0) === 0.0))  ? 0.0  : f90_.get(0))


        // return [f90.get(0)]

        let v4_
        // v4_.set(((f88.get(0) < f90.get(0)) && (v20.get(0) > 0.0000000001)) ? (v14.get(0) / v20.get(0) + 1.0) * 50.0 : 50.0)
        v4_ = (v14 / v20 + 1.0) * 50.0

        // return [v4_.get(0)]

        let rsx

        rsx = (v4_ > 100.0) ? 100.0 : (v4_ < 0.0) ? 0.0 : v4_


        lastf90_ = f90_

        lastf88 = f88

        lastf8 = f8

        lastf28 = f28

        lastf30 = f30

        lastf38 = f38

        lastf40 = f40

        lastf48 = f48

        lastf50 = f50

        lastf58 = f58

        lastf60 = f60

        lastf68 = f68

        lastf70 = f70

        lastf78 = f78

        lastf80 = f80


        //
        return rsx

    }


//
// possible entry triggers
    const xdiv = () => {

        let div = false


        let bars100 = bars.slice(-500)
        if (bars100.length < 1) {
            return
        }

        let rsx_ = []


        bars100.forEach((bar) => {
            let close = bar[4]
            let rsx = getRsx(close)
            rsx_.push([rsx.toFixed(8), bar[0], bar[4]])
        })


        let moves = []

        let lastrsx = 0

        if (!rsx_ || !rsx_[0]) {
            return
        }

        rsx_.forEach((rsx) => {


            if (rsx[0] > lastrsx) {
                moves.push(['up', rsx[1], rsx[2], rsx[0]])
                lastrsx = rsx[0]
            } else if (rsx[0] < lastrsx) {
                moves.push(['down', rsx[1], rsx[2], rsx[0]])
                lastrsx = rsx[0]
            } else {
                moves.push([(moves[moves.length - 1])[0], rsx[1], rsx[2], rsx[0]])
                lastrsx = (moves[moves.length - 1])[0]
            }
        })

        let pivots = []
        let lastmove = ''
        let count = 0

        moves.forEach((move) => {
            if (move[0] === lastmove) {
                count++
                pivots.push(['no' + move[0][0], move[1], move[2], move[3]])
            } else {
                pivots.push(['p-' + move[0][0] + '' + count, move[1], move[2], move[3]])
                count = 0
                lastmove = move[0]
            }
        })


        let pivs = pivots

        pivs.pop()

        pivs.reverse()


        let piv0 = pivs[0]

        pivs.shift()


        // console.log('piv0: ' + new Date(piv0[1]-60000))
        // console.log('piv1: ' + pivs[1])
        // console.log('piv2: ' + pivs[2])

        // console.log('piv0 type: ' + piv0)

        if (piv0[0].includes('p')) {
            let side = piv0[0].includes('u')

            // strat_.size = Math.abs(strat_.size)*side?-1:1

            // return true

            // console.log('pivot, side: ' + side)

            //check if last 5 (side)s were price divs

            let last5similars = []

            pivs.forEach((piv) => {

                if (last5similars.length === 2) {
                    return
                }

                if (piv[0].includes('p')) {
                    if ((side && piv[0].includes('u')) || (!side && piv[0].includes('d'))) {
                        last5similars.push(piv)
                    }
                }

            })

            // console.log('last5: ' + JSON.stringify(last5similars))

            if (side) {
                last5similars.forEach((simpiv => {


                    if (piv0[3] < 50 && piv0[2] < simpiv[2] && piv0[3] > simpiv[3]) {

                        console.log('piv0[3]<50: ' + piv0[3] + 'piv0[2]: ' + piv0[2] + ' islessthan simpiv[2]: ' + simpiv[2] + ' and piv0[3]: ' + piv0[3] + ' isgreterthan sim3: ' + simpiv[3])

                        console.log('piv0: ' + JSON.stringify(piv0))
                        console.log(new Date(piv0[1]))

                        console.log('simpiv: ' + JSON.stringify(simpiv))
                        console.log(new Date(simpiv[1]))

                        console.log('div! long it')

                        nodelet.strat.size = Math.abs(nodelet.strat.size)

                        div = true
                    }
                }))
            } else {

                last5similars.forEach((simpiv => {


                    if (piv0[3] > 50 && piv0[2] > simpiv[2] && piv0[3] < simpiv[3]) {

                        console.log('piv0[3]>50: ' + piv0[3] + 'piv0[2]: ' + piv0[2] + ' isgreaterthan simpiv[2]: ' + simpiv[2] + ' and piv0[3]: ' + piv0[3] + ' islessthan sim3: ' + simpiv[3])

                        console.log('piv0: ' + JSON.stringify(piv0))
                        console.log(new Date(piv0[1]))

                        console.log('simpiv: ' + JSON.stringify(simpiv))
                        console.log(new Date(simpiv[1]))

                        console.log('div! short it')

                        nodelet.strat.size = -Math.abs(nodelet.strat.size)

                        div = true
                    }
                }))

            }

        }


        lastf90_ = 0
        lastf88 = 0
        lastf8 = 0
        lastf28 = 0
        lastf30 = 0
        lastf38 = 0
        lastf40 = 0
        lastf48 = 0
        lastf50 = 0
        lastf58 = 0
        lastf60 = 0
        lastf68 = 0
        lastf70 = 0
        lastf78 = 0
        lastf80 = 0

        return div
    }


}

