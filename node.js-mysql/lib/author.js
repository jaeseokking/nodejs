var db = require('./db')
var template = require('./template.js');
var qs = require('querystring');
var url = require('url');

exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, function(error,topics){
        db.query(`SELECT * FROM author`, function(error2,authors){
            var title = 'author';
            var list = template.list(topics);
            var html = template.HTML(title, list,
            `
            ${template.authorTable(authors)}
            <style>
                table{
                    border-collapse: collapse;
                }
                td{
                    border:1px solid black;
                }
            </style>
            
            <form action="/author/create_process" method="post">
                <p>
                    <input type="text" name="name" placeholder="이름">
                </p>
                <p>
                    <textarea name="profile" placeholder="내용"></textarea>
                </p>
                <p>
                    <input type="submit"  value="생성">
                </p>
            </form>
            
            `,
            ``
            );
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`insert into author (name, profile)  
            values(?, ?)`,
          [post.name, post.profile],
          function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/author`});
            response.end();
          }
         )
     })
}

exports.update = function(request, response){
    db.query(`SELECT * FROM topic`, function(error,topics){
        db.query(`SELECT * FROM author`, function(error2,authors){
            var _url = request.url;
            var queryData = url.parse(_url, true).query;
            db.query(`SELECT * FROM author where id=?`,[queryData.id], function(error3,author){
            var title = 'author';
            var list = template.list(topics);
            var html = template.HTML(title, list,
            `
            ${template.authorTable(authors)}
            <style>
                table{
                    border-collapse: collapse;
                }
                td{
                    border:1px solid black;
                }
            </style>
            
            <form action="/author/update_process" method="post">
                <p>
                    <input type="hidden" name="id" value-"${queryData.id}">
                </p>
                <p>
                    <input type="text" name="name" value="${author[0].name}" placeholder="이름">
                </p>
                <p>
                    <textarea name="profile" placeholder="내용">${author[0].profile}</textarea>
                </p>
                <p>
                    <input type="submit"  value="수정">
                </p>
            </form>
            
            `,
            ``
            );
            response.writeHead(200);
            response.end(html);
            });
            
            
        });
    });
}

exports.update_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`update author set name = ?, profile = ? where id=? `,
          [post.name, post.profile, post.id],
          function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/author`});
            response.end();
          }
         )
     })
}

exports.delete_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`delete from topic where author_id = ? `,
          [post.id],
          function(error1, result1){
              if(error){
                  throw error;
              }
          });
          db.query(`
            delete from author where id=? `,
            [post.id],
            function(error, result){
                if(error){
                throw error;
            }
            response.writeHead(302, {Location: `/author`});
            response.end();
          }
         )
     })
}