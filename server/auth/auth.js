const jwt=require('jsonwebtoken');
const _=require('underscore');

const common_rolecache = require('./common_roles.json');
const common_params = require('./common_params_api.json');
const mongo = require('../common/mongo_connect');
const crypto = require('../common/crypto');

const fs = require('fs');
var async = require('async');

const url = require('url'); 

function auth(req,res,callback){
    
    let arr = req.url.split("?");

    if(_.contains(common_rolecache,arr[0])){
        callback();
    
    }
    else{

        validate(arr[0],function(result){
            if(result.msg)
            {
                callback();
            }
            else if(req.headers.token)
            { 
                crypto.validate_authtoken(req.headers.token,function(details){

                    if(details._id)
                    {
                    let query={};
                    query._id=details._id;
                    
                    mongo.retriveall("users",query,function(err,result){
                        
                        if(err)
                            res.status(400).send({error:err,status:400});
                        
                        if(result.length > 0)
                            callback();
                        else
                            res.status(404).send({error:"This user Not Available",status:404});    
                    })
                    }
                    else
                        res.status(401).send({error:"Auth_token Invalid",status:401});

                    })
                 }
            else
                res.status(401).send({error:"Auth_token required",status:401});

         })
    }
    
};


function validate(url,callback)
{
        let path=url.split("/");
        let valid=false;

        for(let i=0;i<common_params.length;i++)
        {
            let length=common_params[i].split("/");
            let j;
            if(path.length == length.length)
            {
                for(j=0;j<length.length;j++)
                {
                    if(length[j]=="*" || length[j]==path[j])
                        continue;
                    else
                        break;
                }
            }
            if(j==path.length)
            {
                valid=true;
                break;
            }
        }

        if(valid)
            callback({msg:true});
        else
            callback({msg:false});
        
        
}
module.exports.auth=auth;
