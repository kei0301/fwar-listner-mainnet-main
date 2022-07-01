require('dotenv').config();

const mongoose = require('mongoose');
const mongoDB = process.env.URL_MONGO;

const dbConfig = {
  user: process.env.USER_MONGO,
  pass: process.env.PASS_MONGO,
  // useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useFindAndModify: false,
};
  mongoose.connect(mongoDB, dbConfig)
  .then(() => {
    console.log('MongoDB connected!!');
  })
  .catch(err => {
    console.log('Failed to connect to MongoDB', err);
});
// mongoose.set('useCreateIndex', true);
//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
