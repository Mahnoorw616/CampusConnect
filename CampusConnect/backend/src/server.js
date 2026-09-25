require('dotenv').config();
const app = require('./app');
const connectDatabase = require('./config/db');
const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => console.log(`CampusConnect API listening on port ${port}`));
  } catch (error) {
    console.error(`Unable to start CampusConnect API: ${error.message}`);
    process.exit(1);
  }
};

startServer();
