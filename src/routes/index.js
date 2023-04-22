const apiRoutes = (app) => {
    app.use('/admin', require('./adminRoutes'));
}

module.exports = apiRoutes