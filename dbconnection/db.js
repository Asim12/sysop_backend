const mongoose = require("mongoose");
require('dotenv').config()
const { DATABASEURL } = process.env;
const connectDB = async () => {
  try {
    let url = (DATABASEURL) ? DATABASEURL : "mongodb+srv://amcodb:tffZNophCueRnmmj@cluster0.ctczktg.mongodb.net/sysop?retryWrites=true&w=majority"
    // let url = "mongodb://localhost:27017/sysop"
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('mongodb is connected')
  } catch (err) {
    console.log('mongodb getting error', err)
    console.log(`Error ${err.message}`.blue);
    process.exit(1);
  }
}; 
module.exports = connectDB;