const express = require('express')
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const listsRouters = require('./routes/listsRouters')
const userRouters = require('./routes/userRouters')
const itemRouters = require('./routes/itemRouters')
const checkAuth= require('./middleware/check-auth')
require('dotenv').config();
const port = process.env.PORT | 5000


app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');  
  next();
});
app.use('/api/users',userRouters)
app.use(checkAuth)
app.use('/list',listsRouters)
app.use('/item',itemRouters)


app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});


app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});


console.log('process.env.DB_USER '+ process.env.DB_USER)
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0lmj6ui.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port);
    console.log(`ToDoList app listening on port ${port}`)
  })
  .catch(err => {
    console.log('process.env.DB_USER '+ process.env.DB_USER+' error:'+err);
  });

