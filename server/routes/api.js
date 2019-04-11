const express=require('express');
const jwt=require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const json2xls = require('json2xls');
const fs = require('fs');

const auth=require('./../auth/auth');
const mongo = require('../common/mongo_connect');
const crypto = require('../common/crypto');

const app=express.Router();

app.get('/',function(req,res){
    res.send('Apis Working Fine');
});

app.post('/login',function(req,res){

    console.log("/* Enter the login */"+JSON.stringify(req.body));

    let body=req.body;

    let query={};
    query.username=body.username;

    mongo.retriveall("users",query,function(err,data){
        if(err)
        {
            console.error(err);
            res.status(400).send({error:err});
        }
        console.log(data);
        if(data.length == 0)
            res.status(404).send({error:"Invalid Email"});
        else{

            crypto.password(body.password,data[0].salt,function(pass){
                
                body.password=pass;

                if(body.password == data[0].password){
                    
                    crypto.create_authtoken(data[0]._id,function(token){
                        
                        res.status(200).send({_id:data[0]._id,token:token});   
                    })
                }else{
                    res.status(501).send({error:"Password Incorrect"});
                }
            })
        }
   });
});

app.post('/register',function(req,res){

    console.log("/* Enter the register */"+JSON.stringify(req.body));
    let body=req.body;

    let query={};
    query.rollnumber=body.rollnumber;

    body.role="student";

    mongo.retriveall("users",query,function(err,data){
        
        if(err)
        {
            console.error(err);
            res.status(400).send({error:err});
        }
        else{
            if(data.length == 0)
            {
                body.salt = uuidv4();

                crypto.password(body.password,body.salt,function(pass){

                    body.password = pass;
                    body._id = uuidv4();

                    mongo.createcommon("users",body,function(err,userinfo){
                        if(err)
                        {
                            console.error(err);
                            res.status(400).send({error:err});
                        }
                        
                        console.log(`user Created ${JSON.stringify(userinfo)}`);
                        res.status(200).send({success:"User Successfully Created"});
                    })
                })
                
            }else{
                
                res.status(400).send({error:"This Rollnumber Already Available"});
            }
        }
    })
});


app.post('/createsubject',function(req,res){
    
    console.log("/* Enter the createsubject */"+JSON.stringify(req.body));
    let body=req.body;

    let query={};
    query.rollnumber=body.rollnumber;

    mongo.retriveall("users",query,function(err,data){
        
        if(err)
        {
            console.error(err);
            res.status(400).send({error:err});
        }
        else{
            if(data.length > 0)
            {
                    body._id = uuidv4();
                    body.studentid = data[0]._id;
                    body.total = parseInt(body.subject1mark) + parseInt(body.subject2mark) + parseInt(body.subject3mark) + parseInt(body.subject4mark) + parseInt(body.subject5mark);
                    body.percentage = (body.total/500)*100;

                    mongo.createcommon("examdetails",body,function(err,userinfo){
                        if(err)
                        {
                            console.error(err);
                            res.status(400).send({error:err});
                        }
                        
                        console.log(`user Created ${JSON.stringify(userinfo)}`);
                        res.status(200).send({success:"Exam Successfully Created"});
                    })
            }else{
                console.log("not available");
                res.status(400).send({error:"This rollnumber Not Available"});
            }
        }
    })
});


app.delete('/delete/student/:student_id',function(req,res){

    console.log("/* Enter the /delete/student */");
    let params=req.params;

    let query ={};
    query._id = params.student_id;

    mongo.retriveall("users",query,function(err,data){
        
        if(data.length != 0)
        {
            mongo.deletecommon("users",query,function(err,output){
                if(err)
                    res.status(400).send({error:err});
                else{
                    console.log(`student Deleted ${JSON.stringify(output)}`);
                    res.status(200).send({success:"student Successfully Deleted"});
                }
            });
        }else{
            res.status(400).send({error:"student Not Found"});
        }
            
    });
});

app.get('/get/students',function(req,res){

    console.log("/* Enter the /get/students */");
    let Query=req.query;
    let query={};
    query.role="student";
    let order={};
    order[Query.ordername]=parseInt(Query.order);

    mongo.retriveorderdate("users",query,order,function(err,output){
        if(err)
            res.status(400).send({error:err});
        else{
            console.log(`students length  ${JSON.stringify(output.length)}`);
            
            res.status(200).send(output);
        }
    });
});


app.get('/get/examdetails',function(req,res){

    console.log("/* Enter the /get/examdetails */");
    let Query=req.query;
    let query={};
    let order={};
    order[Query.ordername]=parseInt(Query.order);

    mongo.retriveorderdate("examdetails",query,order,function(err,output){
        if(err)
            res.status(400).send({error:err});
        else{
            console.log(`examdetails length  ${JSON.stringify(output.length)}`);
            
            res.status(200).send(output);
        }
    });
});

app.get('/get/userprofile/:userid',function(req,res){

    console.log("/* Enter the /get/userprofile */");
    let params=req.params;
    
    let query={};
    query._id=params.userid;

    mongo.retriveall("users",query,function(err,output){
        if(err)
            res.status(400).send({error:err,status:400});
        else{
            console.log(`users length  ${JSON.stringify(output.length)}`);
            
            res.status(200).send(output[0]);
        }
    });
});



app.get('/download/examdetails',function(req,res){

    console.log("/* Enter the /download/examdetails */");

    mongo.retriveorderdate("examdetails",{},{"rank":1},function(err,output){
        if(err)
            res.status(400).send({error:err});

        var xls = json2xls(output,{fields:['rollnumber','subject1','subject1mark','subject2','subject2mark','subject3','subject3mark','subject4','subject4mark','subject5','subject5mark','total','rank','percentage']});
        
        fs.writeFileSync('data.xlsx', xls, 'binary');
        var file ='data.xlsx';
        
        res.download(file, 'report.xlsx');
    });
});

app.get('/download/studentlist',function(req,res){

    console.log("/* Enter the /download/studentlist */");

    mongo.retriveorderdate("users",{},{"grade":1},function(err,output){
        if(err)
            res.status(400).send({error:err});

        var xls = json2xls(output,{fields:['rollnumber','firstname','lastname','age','gender','department','grade']});
        
        fs.writeFileSync('student.xlsx', xls, 'binary');
        var file ='student.xlsx';
        
        res.download(file, 'studentreport.xlsx');
    });
});

app.put('/update/student/:student_id',function(req,res){

    console.log(`/* Enter the /update/userprofile */${JSON.stringify(req.body)}`);
    let params=req.params;
    let body=req.body;

    let query={};
    query._id=params.student_id;

    let set={}
    set.$set={};

    if(body.rollnumber)
        set.$set.rollnumber=body.rollnumber;
    if(body.firstname)
        set.$set.firstname=body.firstname;
    if(body.lastname)
        set.$set.lastname=body.lastname;
    if(body.age)
        set.$set.age=body.age;
    if(body.gender)
        set.$set.gender=body.gender;
    if(body.age)
        set.$set.gender=body.gender;
    if(body.grade)
        set.$set.grade=body.grade;
    if(body.department)
        set.$set.department=body.department;

    if(body.password)
    {
        let salt=uuidv4();
        crypto.password(body.password,salt,function(pass){

            set.$set.password = pass;
            set.$set.salt = salt;
        });
    }
    mongo.updatecommon("users",query,set,function(err,output){
        if(err)
            res.status(400).send({error:err,status:400});
        else{

            mongo.retriveall("users",query,function(err,user){
                if(err)
                    res.status(400).send({error:err,status:400});  

                user[0].status=200;
                res.status(200).send(user[0]);
            });
            
        }
    });
});




module.exports=app;
