var mysql = require('mysql');
var db = mysql.createConnection({
	host	: '',
	user	: '',
	password: '',
	database: ''
})
db.connect();
module.exports = db; //하나의 모듈만 사용가능하게 할때