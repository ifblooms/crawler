var express = require('express');
var app = express();
var request = require('request');
var cheerio = require('cheerio');//抓取HTML
var async = require('async');//异步抓取
var mysql = require('mysql');//写入数据库
var connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'5231200990',
  database:'crawler'
});

var dataArr = [],
    urlArr = [],
    urlBase = 'http://www.toutiao.com/api/pc/feed/?category=__all__&utm_source=toutiao&widen=';

//抓取今日头条10页数据
for(var i=1; i<3;i++){
  urlArr.push(urlBase+i);
}


app.get('/', function(req, res) {
  async.eachSeries(urlArr,function(url,callback){//循环抓取
    console.log('抓取'+url);
    request(url,function(error, response, body) {
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body);

        //今日头条为json数据，不用cheerio
        // var $ = cheerio.load(body.data);
        // var list = [];
        // $('.WB_cardwrap').each(function(i,e){
        //   list.push(i);
        // });
        // res.json({
        //   data:list.join(',')
        // });

        for (var i = 0; i < body.data.length; i++) {
          dataArr.push(body.data[i].title);
        }

        callback(error);
      }
    });
  },function(error){//全部结束
    if(error){
      console.log('error:'+error);
    }else{
      console.log('抓取结束');
      //写入数据库
      writeMysql(dataArr);
      //查看输出
      res.send(dataArr.join('<br>'));
    }
  });
});

function writeMysql(data){

connection.connect();

  var  addSql = 'INSERT INTO websites(Id,name) VALUES(0,?)';

  async.eachSeries(data,function(e,callback){//循环写入数据

    connection.query(addSql,e,function (err, result) {
      if(err){
       console.log('[INSERT ERROR] - ',err.message);
       return;
      }
      callback();
     // console.log('--------------------------INSERT----------------------------');
     // console.log('INSERT ID:',result);
     // console.log('-----------------------------------------------------------------\n\n');
    });

  },function(error){//全部结束
    if(error){
      console.log('error:'+error);
    }else{
      console.log('写入结束');
      connection.end();
    }
  });
}



var server = app.listen(3000, function() {
  console.log('listening at 3000');
});
