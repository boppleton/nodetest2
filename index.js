console.log('nodetest2 startt')



const api = require('./api.js').start()




const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

client.connect();


// client.query('INSERT INTO log (text, time) VALUES ($1, $2)',['logtextt hi', 90015132000], (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
//     // client.end();
// });
//
//
//
// client.query('INSERT INTO trades (active, trigger, entryPrice, entrySize, tpPrice, stopPrice, ' +
//     'startBalance, endingBalance, pnl, diff, resultType, resultMove, filled, startTime, endTime, endPrice, startStartEquity ) ' +
//     'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)',
//     [false, 'xdivtrig', 9001, 250, 9100, 8900, 0.01, 0.0115, 0.001, 'diffff', 'tp', 1, 100, 100808080, 100080080, 9001, 0.01], (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
//     // client.end();
// });
//
// client.query('INSERT INTO strat (name, symbol, tf, tpPercent, stopPercent, size, scalePercent, scaleQty, scaleWeight, trigger, scaleChase ) ' +
//     'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
//     ['strat111', 'XBTUSD', 1, 0.36, 2.1, 10, 2, 20, 5, 'xdiv', true], (err, res) => {
//         if (err) throw err;
//         for (let row of res.rows) {
//             console.log(JSON.stringify(row));
//         }
//         // client.end();
//     });
//
//
//
// setInterval(()=>{
//
//     console.log('\n printing log..')
//
//     client.query('SELECT * FROM log', (err, res) => {
//         if (err) throw err;
//         for (let row of res.rows) {
//             console.log(JSON.stringify(row));
//         }
//         // client.end();
//     });
//
//     console.log('printing strat..')
//
//     client.query('SELECT * FROM strat', (err, res) => {
//         if (err) throw err;
//         for (let row of res.rows) {
//             console.log(JSON.stringify(row));
//         }
//         // client.end();
//     });
//
//     console.log('printing trades..')
//
//     client.query('SELECT * FROM trades', (err, res) => {
//         if (err) throw err;
//         for (let row of res.rows) {
//             console.log(JSON.stringify(row));
//         }
//         // client.end();
//     });
//
//
//
// },5000)



// client.query('CREATE TABLE log (\n' +
//     '  ID SERIAL PRIMARY KEY,\n' +
//     '  text VARCHAR(200),\n' +
//     '  time BIGINT\n' +
//     ');', (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
//     client.end();
// });

// client.query('CREATE TABLE trades (\n' +
//     '  ID SERIAL PRIMARY KEY,\n' +
//     '  active BOOLEAN,\n' +
//     '  trigger VARCHAR(30),\n' +
//     '  entryPrice NUMERIC,\n' +
//     '  entrySize NUMERIC,\n' +
//     '  tpPrice NUMERIC,\n' +
//     '  stopPrice NUMERIC,\n' +
//
//     '  startBalance NUMERIC,\n' +
//     '  endingBalance NUMERIC,\n' +
//     '  pnl NUMERIC,\n' +
//     '  diff VARCHAR(50),\n' +
//     '  resultType VARCHAR(30),\n' +
//     '  resultMove NUMERIC,\n' +
//     '  filled NUMERIC,\n' +
//     '  startTime NUMERIC,\n' +
//     '  endTime NUMERIC,\n' +
//     '  endPrice NUMERIC,\n' +
//     '  startStartEquity NUMERIC\n' +
//
//
//     ');', (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
//     client.end();
// });
//
client.query('CREATE TABLE strat (\n' +
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
    '  scaleChase BOOLEAN\n,' +
    ');', (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
        console.log(JSON.stringify(row));
    }
    // client.end();
});

// client.query('INSERT INTO log (text, time)\n' +
//     '  VALUES (\'Jerry\', 11), (\'George\', 22);', (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
//     client.end();
// });


