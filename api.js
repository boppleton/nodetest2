///
/// setup the api server with base endpoint, returns obj to set GETs and POSTS from
///

const express = require('express')

module.exports = {

    start: () => {

        const api = express()
        const port = process.env.PORT || 3001

        //root endpoint
        api.get('/', (req, res) => res.send('[///]'))

        api.post('/', function (request, response) {
            console.log('request: ' + request.body)
        })

        // Parse URL-encoded bodies (as sent by HTML forms)
        api.use(express.urlencoded());

        // Parse JSON bodies (as sent by API clients)
        api.use(express.json());

        api.listen(port, () => console.log(`api server started on port ${port}`))

        return api
    }
}
