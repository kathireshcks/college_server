const mongodb = require('mongodb').MongoClient;
const cjson = require('cjson');
const uuidv4 = require('uuid/v4');
const config = cjson.load(__dirname +'/config.json');
const crypto = require('./crypto');

mongodb.connect(config.Mongo_URL, { useNewUrlParser: true },(err,client)=>{
    if(err){
        console.log("error"+err);
    }else{
        global.db = client.db(config.Db); 
        console.log("connected to mongodb");


        body={
            "firstname" : "kathir",
            "lastname" : "kumar",
            "age" : "23",
            "gender" : "male",
            "department" : "admin",
            "password" : "12345678",
            "role":"admin",
            "username":"admin@yopmail.com"
        }
        
        body.salt = uuidv4();
        let query={};
        query.role="admin";
        query.username="admin@yopmail.com";
    
        retriveall("users",query,function(err,output){
    
            if(output.length <= 0)
            {
                crypto.password(body.password,body.salt,function(pass){
    
                    body.password = pass;
                    body._id = uuidv4();
    
                    createcommon("users",body,function(err,userinfo){
                        if(err)
                        {
                            console.error(err);
                        }
                        
                        console.log(`admin Created `);
                    })
                })
            }
            else
                console.log(`admin already Created `);
        });
    }
});


function retriveall(collection,query,callback)
{
    console.log("/*  Enter retrive all  */");
    console.log(`Query : ${JSON.stringify(query)}`);

    db.collection(collection).find(query).toArray(function(err,output){
        if(err)
        {
            console.error(err);
            callback(err);
        }else{
            console.log(`output length : ${output.length}`);
            callback(null,output);
        }
    })
}



function createcommon(collection,request,callback)
{
    console.log("/*  Enter createcommon  */");
    console.log(`request : ${JSON.stringify(request)}`);

    db.collection(collection).insert(request,function(err,output){
        if(err)
        {
            console.error(err);
            callback(err);
        }else{
            console.log(`output  : ${output}`);
            callback(null,output);
        }
    })
}



function updatecommon(collection,query,set,callback)
{
    console.log("/*  Enter updatecommon  */");
    console.log(`query : ${JSON.stringify(query)}`);
    console.log(`set : ${JSON.stringify(set)}`);

    db.collection(collection).updateOne(query,set,function(err,output){
        if(err)
        {
            console.error(err);
            callback(err);
        }else{
            console.log(`output  : ${output}`);
            callback(null,output);
        }
    })
}



function deletecommon(collection,query,callback)
{
    console.log("/*  Enter deletecommon  */");
    console.log(`query : ${JSON.stringify(query)}`);

    db.collection(collection).deleteOne(query,function(err,output){
        if(err)
        {
            console.error(err);
            callback(err);
        }else{
            console.log(`output  : ${output}`);
            callback(null,output);
        }
    })
}

function retrivebyorder(collection,query,limit,skip,orderby,callback)
{
    console.log("/*  Enter retrivebyorder  */");
    console.log(`Query : ${JSON.stringify(query)}`);
    console.log(`orderby : ${JSON.stringify(orderby)}`);
    console.log(`skip : ${skip} limit : ${limit}`);
    
    db.collection(collection).find(query).sort(orderby).skip(skip).limit(limit).toArray(function(err,output){    
        if(err)
        {
            console.error(err);
            callback(err);
        }else{
            console.log(`output length : ${output.length}`);
            callback(null,output);
        }
    })
}


function retriveorderdate(collection,query,order,callback)
{
    console.log("/*  Enter retriveorderdate  */");
    console.log(`Query : ${JSON.stringify(query)}`);
    console.log(`orderby : ${JSON.stringify(order)}`);
    
    db.collection(collection).find(query).sort(order).toArray(function(err,output){    
        if(err)
        {
            console.error(err);
            callback(err);
        }else{
            console.log(`output length : ${output.length}`);
            callback(null,output);
        }
    })
}

function retrivecount(collection,query,callback)
{
    console.log("/*  Enter retrivecount  */");
    console.log(`Query : ${JSON.stringify(query)}`);
    
    
    db.collection(collection).find(query).count(function(err,output){    
        if(err)
        {
            console.error(err);
            callback(err);
        }else{
            console.log(`output length : ${output}`);
            callback(null,output);
        }
    })
}
module.exports.retriveall = retriveall;
module.exports.createcommon = createcommon;
module.exports.updatecommon = updatecommon;
module.exports.deletecommon = deletecommon;
module.exports.retrivebyorder = retrivebyorder;
module.exports.retriveorderdate = retriveorderdate;
module.exports.retrivecount = retrivecount;