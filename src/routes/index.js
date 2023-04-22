const assignRoutes = (app) => {
    app.use('/lender', require('../routes/commonRoutes'));
}

module.exports = assignRoutes;