var express = require('express');
var STS = require('ali-oss').STS;
var co = require('co');
var fs = require('fs');
var app = express();

app.get('/', function (req, res) {
  var conf = {
    "AccessKeyId" : "LTAI5t8wUwnRmW544wQTnFHP",
    "AccessKeySecret" : "zNvSIC2s2w1A6eqIdmwGEpx9tAkU6T",
    "RoleArn" : "acs:ram::1391519769809187:role/aliyunosstokengeneratorrole",
    "TokenExpireTime" : "3600",
    "PolicyFile": "policy/all_policy.txt"
  }

  var policy;
  if (conf.PolicyFile) {
    policy = fs.readFileSync(conf.PolicyFile).toString('utf-8');
  }

  var client = new STS({
    accessKeyId: conf.AccessKeyId,
    accessKeySecret: conf.AccessKeySecret,
  });

  co(function* () {
    var result = yield client.assumeRole(conf.RoleArn, policy, conf.TokenExpireTime);
    console.log(result);

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-METHOD', 'GET');
    res.json({
      StatusCode: 200,
      AccessKeyId: result.credentials.AccessKeyId,
      AccessKeySecret: result.credentials.AccessKeySecret,
      SecurityToken: result.credentials.SecurityToken,
      Expiration: result.credentials.Expiration
    });
  }).then(function () {
    // pass
  }).catch(function (err) {
    console.log(err);
    res.status(err.statusCode);
    res.json({
        StatusCode: 500,
        ErrorCode: err.code,
        ErrorMessage: err.message
    });
  });
});

app.listen(9000, function () {
  console.log('App started.');
});
