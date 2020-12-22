const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const email  = require('./sendemail.js');
const dynamo  = require('./dynamo.js');
const cors = require('cors')
app.use(express.json());
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.urlencoded({extended:false}))

//GET
app.use((req,res,next)=>{
   res.header('Access-Control-Allow-Origin', '*');
   next();
})
app.get('/', (req, res) => {
   res.status(200).send('hello world!');
});

app.post('/user/sendmail', (req, res) => {
   email.sendMail(req,res);
});

app.post('/save/receipt', (req, res) => {
   dynamo.saveEmail(req,res);
});

app.get('/user/details', (req, res, next) => {
   dynamo.getAllDetails(req,res);
});


module.exports = app;
