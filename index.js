const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('./src/config/db')
const { logger } = require('./src/winston/logger');
app.use(bodyParser.json());
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT;
const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use((req, res, next) => {
  logger.defaultMeta.path = `${req.method} ${req.path}`;
  next();
});
const routes = require('./src/routes/index')
routes(app)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 