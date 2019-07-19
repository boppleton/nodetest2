//
// stuff
//

module.exports = {

    loop: (ms, fun, timeout) => {
        setTimeout(() => {
            setInterval(fun, ms)
        }, timeout || 0)
    },

    last: (array) => {
        return array[array.length-1]
    },




}
