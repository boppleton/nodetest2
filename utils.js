///
/// setup the api server with base endpoint, returns obj to set GETs and POSTS from
///

const express = require('express')

module.exports = {

    loop: (ms, fun, timeout) => {
        setTimeout(() => {
            setInterval(fun, ms)
        }, timeout || 0)
    }


}
