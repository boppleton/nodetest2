console.log('nodetest2 startt')



const api = require('./api.js').start()




const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

client.connect();

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

client.query('CREATE TABLE trades (\n' +
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
    if (err) throw err;
    for (let row of res.rows) {
        console.log(JSON.stringify(row));
    }
    client.end();
});

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
    client.end();
});

// client.query('INSERT INTO log (text, time)\n' +
//     '  VALUES (\'Jerry\', 11), (\'George\', 22);', (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
//     client.end();
// });

client.query('SELECT * FROM log', (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
        console.log(JSON.stringify(row));
    }
    client.end();
});


setInterval(()=>{console.log('5s loop')},5000)
