const port = process.env.PORT;

module.exports = function(req, res, next) {
    return Promise.resolve(res.status(200)).then(() => console.log(`Health checked on port: ${port}. Status: healthy.`));
};