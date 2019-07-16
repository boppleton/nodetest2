///
/// postgres database
///

const { Client } = require('pg');

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

    get: (name) => {
            client.query('SELECT * FROM ' + name, (err, res) => {
                if (err) throw err
                console.log('\n printing '+name+'..')
                for (let row of res.rows) {
                    console.log(JSON.stringify(row))
                }
                // client.end();
                return res.rows
            })
    },

    add: (name, strings, vars) => {

        let varstring = ''

        console.log('vars ' + vars)
        for (let i = 0; i < vars.length; i++) {
            console.log('add..')
            varstring = varstring + ('$'+(i+1)+(i===vars.length-1?'':', '))
        }

        console.log('varstring: ' + varstring)

        client.query('INSERT INTO '+name+' ('+strings+')\n' +
            '  VALUES ('+varstring+');', vars, (err, res) => {
            if (err) throw err
            for (let row of res.rows) {
                console.log(JSON.stringify(row))
            }
            // client.end()
        })
    },

    update: (name, vars) => {
        client.query('UPDATE '+name+'\n' +
            vars +
            // 'set outtime = now()\n' +
            ' WHERE id = (select max(ID) from '+name+');', (err, res) => {
            if (err) throw err
            for (let row of res.rows) {
                console.log(JSON.stringify(row))
            }
            // client.end()
        })
    }

}
