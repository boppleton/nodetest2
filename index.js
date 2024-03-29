/// botism node v1.2

require('dotenv').config()
const WebSocket = require('ws')
const rp = require('request-promise')
const _ = require('lodash')
const api = require('./api.js').start()
const db = require('./db.js')
const utils = require('./utils.js')

console.log('+++ starting botism node at ' + new Date())

db.start()



// db.drop('strat1')
// db.drop('strat2')
// db.drop('log1')
// db.drop('log2')
// db.drop('trades1')
// db.drop('trades2')
//
// return



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

setTimeout(() => {
    newNodelet('dbbacc1', process.env['KEY' + (nodelets.length + 1)], process.env['SEC' + (nodelets.length + 1)])
}, 2000)
// setTimeout(()=>{newNodelet('dbbacc2', process.env['KEY'+(nodelets.length+1)], process.env['SEC'+(nodelets.length+1)])},10000)

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
    //
    // db.add('strat'+nodelet.id,
    //     'name, running, symbol, tf, tppercent, stoppercent, size, scalepercent, scaleqty, scaleweight, trigger, scalechase'
    //     ,[
    //         'new'+nodelet.id,
    //         false,
    //         'XBTUSD',
    //         1,
    //         0.36,
    //         4.1,
    //         5,
    //         4,
    //         20,
    //         3,
    //         'xdiv',
    //         true
    //     ])


    // utils.loop(5000, ()=>{
    //
    // }, 5000)


    // utils.loop(1000, ()=>{
    //
    //     let trade = utils.last(nodelet.trades)
    //
    //     db.update('trades'+nodelet.id,
    //         'active = ' + trade.active  +
    //         ', trigger = \'' + trade.trigger + '\'' +
    //         ', entryPrice = ' + (trade.entryPrice==null?0:trade.entryPrice) +
    //         ', entrySize = ' + (trade.entrySize==null?0:trade.entrySize) +
    //         ', tpPrice = ' + (trade.tpPrice==null?0:trade.tpPrice) +
    //         ', stopPrice = ' + _.now() +
    //         ', startBalance = ' + (trade.startBalance==null?0:trade.startBalance) +
    //         ', endingBalance = ' + (trade.endingBalance==null?0:trade.endingBalance) +
    //         ', pnl = ' + (trade.pnl==null?0:trade.pnl )+
    //         ', diff = \'' + trade.diff +  '\'' +
    //         ', resultType = \'' + trade.resultType +  '\'' +
    //         ', resultMove = ' + (trade.resultMove==null?0:trade.resultMove) +
    //         ', filled = ' + (trade.filled==null?0:trade.filled) +
    //         ', startTime = ' + (trade.startTime==null?0:trade.startTime) +
    //         ', endTime = ' + (trade.endTime==null?0:trade.endTime) +
    //         ', endPrice = ' + (trade.endPrice==null?0:trade.endPrice) +
    //         ', startStartEquity = ' + (trade.startStartEquity==null?0:trade.startStartEquity))
    // },10000)

    setTimeout(() => {

        db.get('log' + nodelet.id, (log) => {
            if (log) {
                nodelet.log = log
            }
        })

        db.get('strat' + nodelet.id, (strat) => {
            console.log('set strat to ' + JSON.stringify(strat))
            if (utils.last(strat)) {
                nodelet.strat = strat
            }
        })

        db.get('trades' + nodelet.id, (trades) => {
            if (trades) {

                console.log('got tradesdb, ' + JSON.stringify(trades))


                let revtrades = trades.reverse()

                console.log('reversing, now ' + revtrades)
                nodelet.trades = revtrades


                console.log('len0'+ (nodelet.trades.length>0))

                console.log('nodelettrades: ' + JSON.stringify(nodelet.trades))

                if (nodelet.trades.length>0) {
                    console.log(' last trade: ' + JSON.stringify(utils.last(nodelet.trades)) + ' active: ' + utils.last(nodelet.trades).active)

                    if (utils.last(nodelet.trades).active || nodelet.trades[0].active) {
                        console.log('active trade found, set nodelet to active')
                        nodelet.running = true

                    }
                }


            }
        })




        // nodelet.log = db.get('log'+nodelet.id)


        // console.log(JSON.stringify(msgg))
        // nodelet.trades = db.get('trades'+nodelet.id)
        // nodelet.strat = db.get('strat'+nodelet.id)
    }, 2000)

    // utils.loop(5000, ()=>{
    //
    //
    //     db.update('strat'+nodelet.id, 'size = \'' + new Date().getTime()+'\'')
    //
    //
    // }, 2000)


    /// set data GET endpoints
    _.forEach(['strat', 'trades', 'log', 'info'], name =>
        api.get('/' + nodelet.id + '/' + name, (req, res) => res.send(nodelet[name])))

    ///
    const log = s => {

        nodelet.log.push({id: nodelet.log.length + 1, text: s, time: _.now()})

        db.add('log' + nodelet.id, 'text, time', [s, new Date().getTime()])

    }

    log('starting nodelet, name: ' + name)


    // db.add('trades'+nodelet.id,
    //     'active, trigger, entryPrice, entrySize, tpPrice, stopPrice, startBalance, endingBalance, ' +
    //     'pnl, diff, resultType, resultMove, filled, startTime, endTime, endPrice, startStartEquity'
    //     ,[
    //     false,
    //     'xdiv',
    //     241,
    //     421,
    //     431,
    //     431,
    //     431,
    //     431.2,
    //     431,
    //     431,
    //     'tp',
    //     431,
    //     341,
    //     431,
    //     431,
    //     341,
    //     0.01
    // ])

    let ws = null

    /// deribit ws
    const socketMessageListener = (msg) => {
        let msgg = JSON.parse(msg.data)

if (!msgg.result) {
            return
        }

        if (msgg.result.equity > 0) {
            // console.log('equity: ' + msgg.result.equity)
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
        log('deribit websocket: [close(brightred)] code: ' + (e && e.code ? e.code : 'none'))

        // if (e && e.code === 1000) {
        //     return
        // }

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

        utils.last(nodelet.strat).running = true


        db.update('strat'+nodelet.id, 'running=true')


        if (nodelet.running) {
            socketCloseListener()
        }

    })

    api.post('/' + nodelet.id + '/stop', function (request, response) {
        // console.log('request: '+request.body.namee);

        log('[stop(orangered)]')

        nodelet.running = false

        utils.last(nodelet.strat).running = false

        if (nodelet.running) {
            socketCloseListener()
        } else {
            ws.close(1000)
        }

    })

    api.post('/' + nodelet.id + '/strat', function (request, response) {
        console.log('post request: ' + request.body)


        if (
            request.body.strat.name === utils.last(nodelet.strat).name
            && request.body.strat.symbol === utils.last(nodelet.strat).symbol
            && request.body.strat.tf === utils.last(nodelet.strat).tf
            && request.body.strat.tppercent === utils.last(nodelet.strat).tppercent
            && request.body.strat.stoppercent === utils.last(nodelet.strat).stoppercent
            && request.body.strat.size === utils.last(nodelet.strat).size
            && request.body.strat.scalepercent === utils.last(nodelet.strat).scalepercent
            && request.body.strat.scaleqty === utils.last(nodelet.strat).scaleqty
            && request.body.strat.scaleweight === utils.last(nodelet.strat).scaleweight
            && request.body.strat.trigger === utils.last(nodelet.strat).trigger
            && request.body.strat.scalechase === utils.last(nodelet.strat).scalechase
        ) {
            console.log('same strat, return')
            return
        }

        log('[strat updated(yellow)]')

        nodelet.strat.push(request.body.strat)

        console.log('new strat: ')

        console.log(utils.last(nodelet.strat))

        // db.add('strat'+nodelet.id,
        //     'name, running, symbol, tf, tppercent, stoppercent, size, scalepercent, scaleqty, scaleweight, trigger, scalechase'
        //     ,[
        //         'new'+nodelet.id,
        //         false,
        //         'XBTUSD',
        //         1,
        //         10.36,
        //         14.1,
        //         15,
        //         14,
        //         120,
        //         3,
        //         'xdiv',
        //         true
        //     ])


        db.get('strat1', (strats)=>{
            console.log(JSON.stringify(strats))
        } )



        let vars = [
            utils.last(nodelet.strat).name,
            false,
            utils.last(nodelet.strat).symbol,
            utils.last(nodelet.strat).tf,
            utils.last(nodelet.strat).tppercent,
            utils.last(nodelet.strat).stoppercent,
            utils.last(nodelet.strat).size,
            utils.last(nodelet.strat).scalepercent,
            utils.last(nodelet.strat).scaleqty,
            utils.last(nodelet.strat).scaleweight,
            utils.last(nodelet.strat).trigger,
            utils.last(nodelet.strat).scalechase
        ]

        console.log('VARS:: ' + JSON.stringify(vars))

        db.add('strat' + nodelet.id,
            'name, running, symbol, tf, tppercent, stoppercent, size, scalepercent, scaleqty, scaleweight, trigger, scalechase'
            , vars)


    })


    /// universal method for exchange api calls
    const _api_ = (exchange, path, params) => {
        if (exchange === 'deribit') {

            if (ws.readyState === 0) {
                return
            }

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

        let t = utils.last(nodelet.trades)

        if (!t) {
            return
        }

        t.endingbalance = nodelet.currentequity
        t.pnl = (t.endingbalance - t.startbalance).toFixed(8)
        // t.pnl = 0

        //fix accuracy after
        if (t.active) {
            if (nodelet.currententry > 0) {
                t.entryprice = nodelet.currententry
            }
        }

        t.resultmove = ((((t.endprice || nodelet.currentbid) - nodelet.currententry) / (nodelet.currententry)) * 100).toFixed(2)

        t.diff = (((t.endingbalance - t.startbalance) / t.startbalance) * 100).toFixed(2) + "%  ($" + ((t.endingbalance - t.startbalance) * nodelet.currentbid).toFixed(2) + ")"

        if (t.diff.includes('finity')) {
            t.diff = 0
        }

        if (!Math.abs(t.pnl>=0)) {
            return
        }

        db.update('trades'+nodelet.id, 'pnl='+t.pnl + ', endingBalance=' + t.endingbalance)

        db.get('trades'+nodelet.id, (trades)=> {

            // console.log('trades'+nodelet.id + 'pnl='+t.pnl + ', endingBalance=' + t.endBalance)

            // console.log('tradesdb: ' + JSON.stringify(trades))

        })

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

        if (utils.last(nodelet.trades) && utils.last(nodelet.trades).active) {
            return
        }

        let trigger = false

        if (utils.last(nodelet.strat).trigger === 'xdiv') {
            trigger = xdiv()
        }


        // log('[nodelet ' + nodelet.id + ' triggerloop..(' + '#46ffc7' + ')]')

        // return

        // pick trigger function
        // let trigger =
        //     xdiv()
        // fish()

        // console.log('trigger loop.  current bid: ' + nodelet.currentBid + 'current equity: ' + nodelet.currentEquity)


        if (trigger || true) {

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
    }, 15000)

    let bars = []

    const getBarsLoop = utils.loop(1000, () => {

        if (!nodelet.running) {
            return
        }

        let url =
            // 'http://localhost:8080/' +
            'https://mysterious-meadow-37959.herokuapp.com/' + utils.last(nodelet.strat).symbol + '/' + (utils.last(nodelet.strat).tf === 1 ? 'm1' : 'h1')

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

        if (!utils.last(nodelet.trades) || !utils.last(nodelet.trades).active) {
            return
        }

        if (nodelet.currentSize === 0 && nodelet.lastCloseSize !== 0) {
            console.log("pos to 0, cancel all and reset!")

            log(('trade id' + utils.last(nodelet.trades).id + " has finished!"))

            utils.last(nodelet.trades).endTime = new Date().getTime()

            db.update('trades'+nodelet.id, 'endtime='+new Date().getTime())


            setTimeout(() => {


                let dec = nodelet.lastEquity - nodelet.currentEquity

                let result = ((dec / nodelet.lastEquity) * 100)

                utils.last(nodelet.trades).endprice = nodelet.currentBid

                utils.last(nodelet.trades).endingbalance = nodelet.currentEquity

                db.update('trades'+nodelet.id, 'endprice='+nodelet.currentbid + ', endingbalance=' + nodelet.currentEquity)



                log('result: [' + (result < 0 ? ('+' + Math.abs(result).toFixed(2)) : '-' + result.toFixed(2)) + '%(' + (result < 0 ? 'yellowgreen' : 'orangered') + ')]')

                nodelet.lastEquity = nodelet.currentEquity
            }, 700)

            nodelet.resetCount = 0

            _api_('deribit', 'private/cancel_all', {})

            nodelet.lastCloseSize = 0

            utils.last(nodelet.trades).resulttype = utils.last(nodelet.trades).pnl > 0 ? 'tp' : 'stop'
            utils.last(nodelet.trades).active = false
            utils.last(nodelet.strat).running = false

            db.update('trades'+nodelet.id, 'resulttype='+ (utils.last(nodelet.trades).pnl > 0 ? '\'tp\'' : '\'stop\'') + ', active=' + false)

            db.update('strat'+nodelet.id, 'running=false')


        } else if (Math.abs(nodelet.currentSize) > Math.abs(nodelet.lastCloseSize)) {

            // console.log(nodelet.currentSize + " size different, reset close")

            let tpPrice = nodelet.currentEntry * (1 + ((utils.last(nodelet.strat).tppercent / 100) * (nodelet.currentSize > 0 ? 1 : -1)))
            let stopPrice = nodelet.currentBid * (utils.last(nodelet.strat).size > 0 ? (1 - (utils.last(nodelet.strat).stoppercent / 100)) : (1 + (utils.last(nodelet.strat).stoppercent / 100)))

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
                // console.log('update close id ' + nodelet.closeID)

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

            utils.last(nodelet.trades).filled = nodelet.currentSize


            utils.last(nodelet.trades).tpprice = tpPrice


            utils.last(nodelet.trades).stopprice = stopPrice

            db.update('trades'+nodelet.id, 'filled='+ nodelet.currentSize + ', tpprice=' + tpPrice + ', stopprice=' + stopPrice)


        }
    })


    function newTrade(trigger, stopp) {
        console.log("!!! new trade on nodelet: " + nodelet.id)
        setTimeout(() => {
            log(nodelet.id + ' [new trade(yellow)] - id: ' + ((nodelet.trades.length>=1 ? utils.last(nodelet.trades).id+1 : 1))
                + ", equity: " + nodelet.currentEquity + ' ($' + (nodelet.currentEquity * nodelet.currentBid).toFixed(2) + ')'
                + ', trigger: ' + trigger
                + ", price: " + nodelet.currentBid
            )
        }, 500)

        // return

        if (utils.last(nodelet.strat).scalechase) {



            let entryloop = setInterval(() => {
                // console.log('entryloop curentsize ' + nodelet.currentSize + ' lastbid: ' + nodelet.lastBid + ' currentbid: ' + nodelet.currentBid)
                if (nodelet.currentSize === 0) {

                    if (nodelet.lastBid === 0) {
                        nodelet.lastBid = nodelet.currentBid
                    }

                    if (nodelet.currentBid !== 0 && nodelet.currentBid === nodelet.lastBid) {
                        return
                    }

                    nodelet.lastBid = nodelet.currentBid

                    log('reset entry orders')
                    _api_('deribit', 'private/cancel_all', {})
                    startTrades('reset')
                } else {
                    log('starting to get filled..')
                    clearInterval(entryloop)

                }

            }, 5000)
        } else {
            startTrades()
        }


        //todo fix this doublecode
        //
        let stopPrice = stopp || (nodelet.currentBid * (1 + ((utils.last(nodelet.strat).stoppercent / 100) * (utils.last(nodelet.strat).size < 0 ? 1 : -1))))
        //
        let sizeLev = Math.ceil((utils.last(nodelet.strat).size * (nodelet.currentEquity * nodelet.currentBid)) / 10) * 10

        let tpPrice = nodelet.currentBid * (1 + ((utils.last(nodelet.strat).tppercent / 100) * (nodelet.currentSize > 0 ? 1 : -1)))



        trade = {
            id: (nodelet.trades.length>=1 ? nodelet.trades.length : 0) + 1,
            active: true,
            trigger: trigger,
            entryprice: nodelet.currentBid,
            entrysize: sizeLev,
            tpprice: tpPrice,
            stopprice: stopPrice,

            startbalance: nodelet.currentEquity,
            endingbalance: nodelet.currentEquity,
            pnl: 0,
            diff: 0,
            resulttype: 'in progress',
            resultmove: 0,
            filled: 0,
            starttime: new Date().getTime(),
            startprice: nodelet.currentBid,
            endtime: 0,
            endprice: 0,
            startstartequity: nodelet.startingequity,
        }

        nodelet.trades.push(trade)



        db.addTrade(nodelet.id, _.values(trade))

        // console.log('added trade: ' + JSON.stringify(_.values(trade)))

        db.get('trade1', (trades)=>{
            console.log('tradesdb addednew: ' + JSON.stringify(trades) )
        })



    }


    const startTrades = (reset) => {

        // console.log('startrades ')


        let side = utils.last(nodelet.strat).size > 0

        let numberOfOrders = utils.last(nodelet.strat).scaleqty

        let prices = []


        let upperPrice
        let lowerPrice

        if (side) {
            upperPrice = nodelet.currentBid
            lowerPrice = upperPrice * (1 - (utils.last(nodelet.strat).scalepercent / 100))
        } else {
            lowerPrice = nodelet.currentBid
            upperPrice = lowerPrice * (1 + (utils.last(nodelet.strat).scalepercent / 100))
        }

        // console.log('side: '+ side +  " upperprice: " + upperPrice + " lowerprice: " + lowerPrice)

        let totalSize = Math.ceil((utils.last(nodelet.strat).size * (nodelet.currentEquity * nodelet.currentBid)) / 10) * 10

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

        if (utils.last(nodelet.strat).scaleweight === 0) {
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
            let maxPercentage = 0.04 * (1.2 + (utils.last(nodelet.strat).scaleweight))
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

        if (utils.last(nodelet.log).text.includes('reset entries attempt')) {

        }


        if (reset) {

            if (nodelet.resetCount === 0) {
                nodelet.resetCount++
                log('entries attempt #' + nodelet.resetCount + ', scaling ' + (trades[0].side ? '[long(yellowgreen)]' : '[short(orangered)]') + ' from ' + trades[0].price.toFixed(1) + ' to ' + utils.last(trades).price.toFixed(1) + ' (' + utils.last(nodelet.strat).scalepercent + '%)'

                    + ', total size: ' + totalSize + ', orders: ' + numberOfOrders + ', weight: ' + utils.last(nodelet.strat).scaleweight)
                // log('entries attempt #' + resetCount + ', scale range ' + upperPrice + ' to ' + lowerPrice )
            } else {
                nodelet.resetCount++

                // if (!nodelet.resetCount % 10 === 0) {
                //     return
                // }


                log('entries attempt #' + nodelet.resetCount + ', scaling ' + (trades[0].side ? '[long(yellowgreen)]' : '[short(orangered)]') + ' from ' + trades[0].price.toFixed(1) + ' to ' + utils.last(trades).price.toFixed(1) + ' (' + utils.last(nodelet.strat).scalepercent + '%)'

                    + ', total size: ' + totalSize + ', orders: ' + numberOfOrders + ', weight: ' + utils.last(nodelet.strat).scaleweight)


                // log_[0] = ['reset entries attempt #' + resetCount + ', new scale range ' + upperPrice.toFixed(1) + ' to ' + lowerPrice.toFixed(1), new Date().getTime()]
            }


        } else {
            log('scaling ' + (trades[0].side ? '[long(yellowgreen)]' : '[short(orangered)]') + ' from ' + trades[0].price.toFixed(1) + ' to ' + (trades[trades.length - 1]).price.toFixed(1) + ' (' + utils.last(nodelet.strat).scalepercent + '%)'

                + ', total size: ' + totalSize + ', orders: ' + numberOfOrders + ', weight: ' + utils.last(nodelet.strat).scaleweight)
        }


        // place trades (trade+stop+reduceTP)


        // console.log("stopprice " + stopPrice)

        trades.forEach((trade) => {

            // console.log("place trade " + JSON.stringify(trade))


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
                "stop_price": (nodelet.currentBid * (1 + ((utils.last(nodelet.strat).stoppercent / 100) * (utils.last(nodelet.strat).size < 0 ? 1 : -1)))),
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

                        utils.last(nodelet.strat).size = Math.abs(utils.last(nodelet.strat).size)

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

                        utils.last(nodelet.strat).size = -Math.abs(utils.last(nodelet.strat).size)

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

