console.log('nodetest2 startt')

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


client.query('INSERT INTO log (text, time)\n' +
    '  VALUES (\'Jerry\', 11), (\'George\', 22);', (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
        console.log(JSON.stringify(row));
    }
    client.end();
});

