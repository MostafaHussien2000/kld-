const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
const dbConnection = () => {
  mongoose
    .connect('mongodb+srv://admin:admin@cluster0.0apjt.mongodb.net/')
    .then((conn) => {
      console.log(`Database Connected: ${conn.connection.host}`);
    });
};

module.exports = dbConnection;
