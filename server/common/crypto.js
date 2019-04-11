const jwt=require('jsonwebtoken');
const crypto = require('crypto');
const uuidv4 = require('uuid/v4');
const secret = '12345678909876543212345678765456';

function create_authtoken(request,callback)
{
    let data={};
    data._id=request;
    let token = jwt.sign(data,secret);
    callback(token);
}

function validate_authtoken(request,callback)
{
    let token=jwt.verify(request,secret);
    callback(token);
}

function password(request,salt,callback)
{
    let password=crypto.createHmac('sha256', secret).update(request+salt).digest('hex');
    callback(password);
}

module.exports.create_authtoken = create_authtoken;
module.exports.validate_authtoken = validate_authtoken;
module.exports.password = password;

