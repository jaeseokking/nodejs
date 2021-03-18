//mysql 모듈을 사용하겠다.
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost', //mysql과 node에서 같은 서버에 있
  user     : 'root',
  password : '',
  database : 'opentutorials'
});
 
//결과가 connection에 담기고 접속완료 
connection.connect();
 
//sql 첫번째 인자, 두번째 콜백은 호출된다. 첫번째 인자의 sql이 데이터베이스에서 실행된 결과가 들어옴
//두번째 인자인 콜백이 호출 
//function의	 error 오류 일
connection.query('SELECT * FROM topic', function (error, results, fields) {
	//첫번째 값이 에러이면 
	//result는 결과값을 받음	
  if (error) {
	  console.log(error);
  }
  
  console.log(results);
});
 
connection.end();