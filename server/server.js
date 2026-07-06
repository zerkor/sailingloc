require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SailingLoc server running on port ${PORT}`);
  });
});
