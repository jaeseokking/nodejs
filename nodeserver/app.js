const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');

//서버 설정
const app = express();
app.set('port', process.env.PORT || 80);

//로그 출력 설정
app.use(morgan('dev'));

//정적 파일이 저장될 디렉토리 설정
app.use(express.static('public'));

//post 방식의 파라미터 읽기
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

//파일 다운로드를 위한 설정 
var util = require('util')
var mime = require('mime')

//에러가 발생한 경우 처리
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).send(err.message)
});

//파일 업로드를 위한 설정
//img 디렉토리를 연결
try {
	fs.readdirSync('public/img');
} catch (error) {
	console.error('img 폴더가 없으면 img 폴더를 생성합니다.');
	fs.mkdirSync('public/img');
}
//파일 이름은 기본 파일 이름에 현재 시간을 추가해서 생성
const upload = multer({
	storage: multer.diskStorage({
		destination(req, file, done) {
			//업로드할 디렉토리 설정
			done(null, 'public/img/');
		},
		filename(req, file, done) {
			//파일 이름 결정
			const ext = path.extname(file.originalname);
			done(null, path.basename(file.originalname, ext) + Date.now() + ext);
		},
	}),
	//파일의 최대 크기 설정
	limits: { fileSize: 10 * 1024 * 1024 },
});

var connection;
function connect(){
	connection = mysql.createConnection({
		host :'localhost',
		port : 3306,
		user : 'root',
		password : '',
		database: 'jaeseok'
	});
	connection.connect(function(err) {
		if (err) {
			console.log('mysql connection error');
			console.log(err);
			throw err;
		}else{
			console.log('mysql connection success');
		}
	});
}

function close(){
	console.log('mysql connection close');
	connection.end();
}

//서버 실행
app.listen(app.get('port'), () => {
	console.log(app.get('port'), '번 포트에서 대기 중');
});

//get 방식으로 / 요청이 오면 index.html을 출력 
app.get('/', (req, res) => {
	  res.sendFile(path.join(__dirname, '/index.html'));
})

//get 방식으로 item/all 요청이 오면 데이터를 리턴
app.get('/item/all', (req, res, next) => {
	//데이터베이스 연결
	connect();
	//데이터 목록을 저장할 변수
	var list;
	//전체 목록 가져오는 SQL을 실행
	connection.query(
		"select * from item order by itemid desc", 
		function(err, results, fields){
			//err은 에러 객체
			//results는 SQL 실행 결과
			if(err){
				throw err;
			}
			//에러가 없는 경우 - 가져온 목록을 list 에 저장
			//결과는 항상 배열입니다.
			list = results;
			res.json({'count':list.length, 'list':list});
			//데이터베이스 닫기
			close();
		})
});

//get 방식으로 /item/viewall 요청이 오면 /item/all.html을 출력 
app.get('/item/viewall', (req, res) => {
	  res.sendFile(path.join(__dirname, '/item/all.html'));
})

//상세보기 서비스 처리
app.get('/item/detail/:itemid', (req, res, next) => {
	//뒤쪽 URL 부분 읽기
	var itemid = req.params.itemid
	//데이터베이스 연결
	connect();
	//데이터 가져오기 SQL 실행
	connection.query('select * from item where itemid=?', 
			[itemid], function(err, results, fields){
		if(err){
			throw err;
		}
		
		//데이터 가져왔는지 확인
		if(results.length == 0){
			res.json({'result':false});
		}else{
			res.json({'result':true, 'item':results[0]})
		}
		close();
	});
});

//item/getitem 요청이 get 방식으로 요청된 경우 처리
//item 디렉토리 안의 detail.html 로 이동
app.get('/item/getitem', (req, res, next) => {
	res.sendFile(path.join(__dirname, '/item/detail.html'));
});

//페이지 단위로 데이터를 넘겨주는 처리
app.get('/item/itemlist', (req, res, next) => {
	//페이지 번호와 데이터 개수를 가져오기 
	//get 방식의 파라미터 읽기
	const pageno = req.query.pageno;
	const count = req.query.count;
	
	//파라미터의 값이 없을때를 위해서 파라미터의 기본값을 설정
	//시작하는 데이터 번호와 페이지 당 데이터 개수 설정
	var start = 0;
	var size = 10;
	
	if(pageno != undefined){
		if(count != undefined){
			size = parseInt(count);
		}
		start = (pageno - 1) * size;
	}
	
	connect();
	connection.query(
		'select * from item order by itemid desc limit ? ,?',
		[start, size], function(err, results, fields){
			if(err){
				throw err;
			}
			var list = results;
			//전체 데이터 개수 가져오기
			connection.query('select count(*) cnt from item',
				function(err, results, fields){
				if(err){throw err;}
				res.json({'count':results[0].cnt, 
					'list':list});
			});
		})
});

//item/paging 요청이 get 방식으로 요청된 경우 처리
//item 디렉토리 안의 paging.html 로 이동
app.get('/item/paging', (req, res, next) => {
	res.sendFile(path.join(__dirname, '/item/paging.html'));
});

//이미지 다운로드를 처리
app.get('/item/img/:fileid', function(req, res){
	//파일 이름 가져오기
	var fileid = req.params.fileid;
	//실제 파일의 경로 만들기
	var file = '/Users/a202_09/node/nodeserver/public/img' + "/" + fileid;
	
	//파일 다운로드 구현
	
	//파일 형식을 구현 
	mimetype = mime.lookup(fileid);
	res.setHeader('Content-disposition', 'attachment; filename=' + fileid); //다운로드될 파일의 이름 설정 
	res.setHeader('Content-type', mimetype);
	//파일 다운로드 
	var filestream = fs.createReadStream(file);
	filestream.pipe(res);
})


//삽입 수정 삭제에 이용할 공통 코드
//년월일 시분초를 저장하기 위한 변수
var year;
var month
var day

var hour
var minute;
var second;

//현재시간을 문자열로 리턴하는 함수
function currentDay(){
	var date = new Date();
	year = date.getFullYear();
	
	//월을 가져오고 월이 10보다 작으면 앞에 0을 추가 
	month = date.getMonth() + 1;
	month = month > 10 ? month : '0' + month;
	
	//일을 가져오고 월이 10보다 작으면 앞에 0을 추가 
	day = date.getDate();
	day = day > 10 ? day : '0' + day;
	
	hour = date.getHours();
	hour = hour > 10 ? hour : '0' + hour
			
	minute = date.getMinutes();
	minute = minute > 10 ? minute : '0' + minute
			
	second = date.getSeconds();
	second = second > 10 ? second : '0' + second
			
			
}

//현재시간을 텍스트 파일에 기록해주는 함수
function updateDate(){
	const writeStream = fs.createWriteStream("./update.txt");
	writeStream.write(year + "-" + month + "-" + day + " " + hour + ":" + month + ":" + second);
}

//삽입 링크를 눌렀을 때 이동할 페이지를 결정하는 코드 
app.get('/item/insert', (req, res, next) => {
	res.sendFile(path.join(__dirname, '/item/insert.html'));
});

//데이터 삽입을 처리하는 코드	//파일이 하나 일때는 single 업로드는 upload 가 알아서 해줌 
app.post('/item/insert', upload.single('pictureurl'), (req, res, next) => {
	//파라미터 가져오기
	const itemname = req.body.itemname;
	const price = req.body.price;
	const description = req.body.description;
	//파일 읽기 
	var pictureurl;
	if(req.file){
		pictureurl = req.file.filename;
	}else{
		pictureurl = "default.jpg";
	}
	
	//데이터베이스 연결
	connect();
	//가장 큰 itemid를 찾아오기
	connection.query('select max(itemid) maxid from item', (err, results, fields) => {
		if(err){
			throw err;
		}
		var itemid;
		if(results.length > 0){
			itemid = results[0].maxid + 1;
		}else{
			itemid = 1;
		}
		
		//현재 날짜와 시간을 가져오기
		currentDay();
		//데이터 삽입 
		connection.query(
			'insert into item(itemid, itemname, price, description, pictureurl, updatedate) values(?,?,?,?,?,?)',
			[itemid, itemname, price, description, pictureurl, year+'-'+month+'-'+day], (err, results, fields) => {
				if(err){
					throw err;
				}
				//삽입에 성공
				if(results.affectedRows > 0){
					updateDate();
					res.json({'result': true})
				}else{
					res.json({'result': false})
				}
				close();
			})
	})
	
})

//item 삭제 요청을 처리할 코드
app.post('/item/delete', (req,res,next) => {
	//파라미터 읽어오기
	const itemid = req.body.itemid;
	//현재 시간 설정하기 
	currentDay();
	//데이터베이스 접속
	connect();
	//SQL 실행
	connection.query(
			'delete from item where itemid = ?', [itemid], (err, results, field)=> {
				if(err){
					throw err
				}
				//삭제 성공 여부 판단
				if(results.affectedRows >= 0){
					res.json({'result' : true})
				}else{ //실패시 
					res.json({'result' : false})
				}
				close();
			})
})

//상세보기에서 수정하기를 클릭했을 때 처리 - 단순한 페이지 이동 
app.get('/item/update', (req,res, next) => {
	//
	console.log('업데이트보기')
	res.sendFile(path.join(__dirname, '/item/update.html'));
})

//데이터 수정을 처리하는 코드	
app.post('/item/update', upload.single('pictureurl'), (req, res, next) => {
	//파라미터 가져오기
	const itemid = req.body.itemid;
	const itemname = req.body.itemname;
	const price = req.body.price;
	const description = req.body.description;
	const oldpictureurl = req.body.oldpictureurl
	
	//파일 읽기 
	var pictureurl;
	if(req.file){
		pictureurl = req.file.filename;
	}else{
		pictureurl = oldpictureurl;
	}
	
	//데이터베이스 연결
	connect();
	
	//현재 날짜와 시간을 가져오기
	currentDay();
	//데이터 삽입 
	connection.query(
		'update item set itemname = ? ,price = ?, description = ? , pictureurl = ?, updatedate= ? where itemid = ?',
		[itemname, price, description, pictureurl, year+'-'+month+'-'+day, itemid], (err, results, fields) => {
			if(err){
				throw err;
			}
			//수정 성공
			if(results.affectedRows > 0){
				updateDate();
				res.json({'result': true})
			}else{
				res.json({'result': false})
			}
			close();
	})
	
})

//마지막 업데이트 된 시간을 리턴하는 처리
app.get("/item/updatedate", (req, res, next) => {
	fs.readFile('./update.txt', function(err, data){
		res.json({'result': data.toString()})
	})
});

app.get('/member/register', (req, res) => {
	  res.sendFile(path.join(__dirname, '/member/register.html'));
});

app.get('/member/idcheck', (req, res) => {
	//get 방식의 파라미터 가져오기
	const memberid = req.query.memberid;
	connect();
	connection.query('SELECT * FROM member where memberid=?', [memberid], function(err, results, fields) {
		if (err){
			throw err;
		}
		if(results[0]){
			//결과가 없으면 중복검사 완료  
			res.json({'result':false}); 
		}else{
			res.json({'result':true}); 
		}
		close();
	});
});

app.get('/member/nicknamecheck', (req, res) => {
	//get 방식의 파라미터 가져오기
	const membernickname = req.query.membernickname;
	connect();
	connection.query('SELECT * FROM member where membernickname=?', [membernickname], function(err, results, fields) {
		if (err){
			throw err;
		}
		if(results[0]){
			res.json({'result':false}); 
		}else{
			res.json({'result':true}); 
		}
		close();
	});
});


app.post('/member/register', (req, res) => {
	//post 방식의 파라미터 가져오기
	const memberid = req.body.memberid;
	const memberpw = req.body.memberpw;
	const membernickname = req.body.membernickname;

	connect();
	connection.query('insert into member(memberid, memberpw, membernickname) values(?, ?, ?)',
			[memberid, memberpw, membernickname], function(err, results, fields) {
		if (err){
			throw err;
		}
		if(results.affectedRows == 1){
			res.json({'result':true}); 
		}else{
			res.json({'result':false}); 
		}
		close();
	});
});

app.get('/member/login', (req, res) => {
	  res.sendFile(path.join(__dirname, '/member/login.html'));
});

app.post('/member/login', (req, res) => {
	//post 방식의 파라미터 가져오기
	const memberid = req.body.memberid;
	const memberpw = req.body.memberpw;
	connect();
	connection.query('SELECT * FROM member where memberid = ? and memberpw=?', [memberid, memberpw], function(err, results, fields) {
		if (err)
			throw err;
		//데이터가 존재하지 않으면 result에 false를 출력 
		if(results.length == 0){
			res.json({'result':false}); 
		}
		//데이터가 존재하면 result에 true를 출력하고 데이터를 item에 출력
		else{
			res.json({'result':true, 'member':results[0]}); 
		}
		close();
	});
});