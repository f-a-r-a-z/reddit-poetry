module.exports = (str) => {
    return str.match(/[a-zA-Z]+('[a-zA-Z]+)?/g) || [];
}
