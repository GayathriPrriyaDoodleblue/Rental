const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { logger } = require('./src/winston/logger');
dotenv.config();
const port = process.env.PORT;
app.use(bodyParser.json());
require('./src/config/db');
app.use((req, res, next) => {
  logger.defaultMeta.path = `${req.method} ${req.path}`;
  next();
});
const routes = require('./src/routes/index');
routes(app);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

