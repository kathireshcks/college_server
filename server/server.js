process.env.NAME = "kathir_server";

const PORT=8100;
const uuidv4 = require('uuid/v4');
const express = require('express');
const bodyparser = require('body-parser');
const api=require('./routes/api');
const auth=require('./auth/auth').auth;
const cors=require('cors');
const fs=require('fs');

const app=express();

app.use(bodyparser.json());
app.use(cors());

app.all('/api/*',auth,function(req, res, next){ 
    console.log("main server");
    next()
 });

app.use('/api',api);

app.get('/',function(req,res){
    res.send('hello from the server id : '+process.pid);
   
});

app.listen(PORT,function(){
    console.log('server running on localhost:'+PORT);
});

