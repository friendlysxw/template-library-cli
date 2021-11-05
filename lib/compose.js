const compose = (composePath,options) => {
    console.log(`composePath`,composePath);
    console.log(`options`,options);
}

module.exports = (composePath, options) => {
    compose(composePath,options)
}