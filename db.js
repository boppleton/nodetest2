///
/// postgres database
///

const {Client} = require('pg')

let client

module.exports = {

    start: () => {

        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true
        })

        client.connect()

        return client
    },

    get: (name, callback) => {
        client.query('SELECT * FROM ' + name, (err, res) => {
            if (err) {
                if (err.toString().includes('does not exist')) {
                    return 0
                } else {
                    throw err
                }

            }
            // console.log('\n printing ' + name + '..')
            for (let row of res.rows) {
                // console.log(JSON.stringify(row))
            }
            // client.end();
            // return res.rows
            callback(res.rows)
        })
    },

    add: (name, strings, vars) => {

        let varstring = ''

        for (let i = 0; i < vars.length; i++) {
            varstring = varstring + ('$' + (i + 1) + (i === vars.length - 1 ? '' : ', '))
        }

        // console.log('add vars: ' + JSON.stringify(vars))
        //
        // console.log('len: ' + vars.length + 'varstrong: ' + varstring)


        client.query('INSERT INTO ' + name + ' (' + strings + ')\n' +
            ' VALUES (' + varstring + ');', vars, (err, res) => {
            if (err) throw err
        })
    },

    addTrade: (id, vars) => {


        let varstring = ''

        for (let i = 0; i < vars.length; i++) {
            varstring = varstring + ('$' + (i + 1) + (i === vars.length - 1 ? '' : ', '))
        }


        client.query('INSERT INTO ' + 'trades' + id + ' (' + 'trades', 'active, trigger, entryPrice, entrySize, tpPrice, stopPrice, ' +
            'startBalance, endingBalance, pnl, diff, resultType, resultMove, filled, startTime, endTime, endPrice, startStartEquity' + ')\n' +
            '  VALUES (' + varstring + ');', vars, (err, res) => {
            if (err) throw err
        })

    },
        //           [false, 'xdivtrig', 7008, 250, 9100, 8900, 0.01, 0.0115, 0.001, 'diffff', 'tp', 1, 100, 100808080, 100080080, 9001, 0.01]

    addStrat: (id, vars) => {



        let varstring = ''

        for (let i = 0; i < vars.length; i++) {
            varstring = varstring + ('$' + (i + 1) + (i === vars.length - 1 ? '' : ', '))
        }


        client.query('INSERT INTO ' + 'strat' + id + ' (' + 'name, symbol, tf, tpPercent, stopPercent, size, scalePercent, scaleQty, scaleWeight, trigger, scaleChase' + ')\n' +
            '  VALUES (' + varstring + ');', vars, (err, res) => {
            if (err) throw err
        })


    }, //            ['strat111', 'XBTUSD', 1, 0.36, 2.1, 10, 2, 20, 5, 'xdiv', true]

    update: (name, vars) => {
        console.log('update: ' + 'UPDATE ' + name + ' ' +
            'SET ' + vars +
            // 'set outtime = now(),\n' +
            ' WHERE id = (select max(ID) from ' + name + ');')

        client.query('UPDATE ' + name + '\n ' +
            'SET ' + vars +
            // 'set outtime = now(),\n' +
            ' WHERE id = (select max(ID) from ' + name + ');', (err, res) => {
            if (err) throw err

        })
    },

    deleteRecent: (name) => {
        client.query('DELETE FROM ' + name + '\n ' +
            ' WHERE id = (select max(ID) from ' + name + ');', (err, res) => {
            if (err) throw err

        })
    },

    drop: (name) => {
        client.query('DROP TABLE ' + name + ';', (err, res) => {
            if (err) throw err
        })
    },

    truncate: (name) => {
        client.query('TRUNCATE ' + name + ';', (err, res) => {
            if (err) throw err
        })
    },

    createAll: (id) => {

        client.query('CREATE TABLE log'+id+' (\n' +
            '  ID SERIAL PRIMARY KEY,\n' +
            '  text VARCHAR(200),\n' +
            '  time BIGINT\n' +
            ');', (err, res) => {
            if (err) throw err
        })

        client.query('CREATE TABLE trades'+id+' (\n' +
            '  ID SERIAL PRIMARY KEY,\n' +
            '  active BOOLEAN,\n' +
            '  trigger VARCHAR(30),\n' +
            '  entryPrice NUMERIC,\n' +
            '  entrySize NUMERIC,\n' +
            '  tpPrice NUMERIC,\n' +
            '  stopPrice NUMERIC,\n' +
            '  startBalance NUMERIC,\n' +
            '  endingBalance NUMERIC,\n' +
            '  pnl NUMERIC,\n' +
            '  diff VARCHAR(50),\n' +
            '  resultType VARCHAR(30),\n' +
            '  resultMove NUMERIC,\n' +
            '  filled NUMERIC,\n' +
            '  startTime NUMERIC,\n' +
            '  endTime NUMERIC,\n' +
            '  endPrice NUMERIC,\n' +
            '  startStartEquity NUMERIC\n' +


            ');', (err, res) => {
            if (err) throw err
        })

        client.query('CREATE TABLE strat'+id+' (\n' +
            '  ID SERIAL PRIMARY KEY,\n' +
            '  name VARCHAR(30),\n' +
            '  symbol VARCHAR(30),\n' +
            '  tf NUMERIC\n,' +
            '  tpPercent NUMERIC\n,' +
            '  stopPercent NUMERIC\n,' +
            '  size NUMERIC\n,' +
            '  scalePercent NUMERIC\n,' +
            '  scaleQty NUMERIC\n,' +
            '  scaleWeight NUMERIC\n,' +
            '  trigger VARCHAR(30)\n,' +
            '  scaleChase BOOLEAN\n' +
            ');', (err, res) => {
            if (err) throw err
        })
    }

}
