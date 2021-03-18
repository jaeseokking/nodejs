const express = require('express')
const morgan = require('morgan')
const path = require('path')
const mysql = require('mysql')
const fs = require('fs')
const multer = require('multer')

//5000번 포트로 서버 설정
const app = express()
app.set('port', process.env.PORT || 8888)

app.use(morgan('dev'))

//item/list 요청이 get 방식으로 온 경우
//파라미터는 pageno(페이지번호), count(페이지 당 보여줘야 하는 데이터개수)
app.get('/item/list', (req, res, next) => {	
	//데이터베이스 연결 객체 생성
	var connection = mysql.createConnection({
		host:'localhost',
		port:3306,
		user:'root',
		password:'',
		database:'jaeseok'
	});
	//데이터베이스 연결
	connection.connect(function(err){
		if(err){	
				console.log('mysql connection error');
				console.log(err)
				throw err
		}
	});
	
	//파라미터 읽기
	//파라미터가 없으면 undefined
	const pageno = req.query.pageno
	const count = req.query.count
	
	//시작 번호와 한 번에 가져올 데이터 개수를 생성
	var start = 0;
	var size = 5;
	
	//pageno 라는 파라미터가 있다면
	//start 와 size 변경
	if(pageno != undefined){
		if(count != undefined){
		size = parseInt(count)
		start = (pageno - 1) * size
		}
	}

	
	
	var list;
	connection.query('select * from goods order by itemid desc limit ?,?',
			[start, size],
			function(err, results, fields) {
			//에러가 있는 경우
	    	if (err){
	    		throw err;
	    	}
	    	
	    	//결과를 list에 저장 
	    	list = results;
	    	//res.json({"list":results})
	    	console.log(results);
	    
	});
	
	//테이블의 전체 데이터 개수 가져오기
	connection.query('select count(*) cnt from goods', 
			function(err, results, fields){
		if(err){
			throw err;
		}
		//json 출력
		res.json({'count':results[0].cnt, 'list':list});
	});
	//접속 종료
	connection.end();
	
});

//상세보기 처리
app.get('/item/detail', (req, res, next)=>{
	//파라미터 읽어오기 (파라미터이름 itemid)
	const itemid = req.query.itemid;
	if(itemid == undefined){
		res.json({'result':false})
	}else{
		//데이터베이스 접속
		var connection = mysql.createConnection({
			host:'localhost',
			port:'3306', //mysql의 기본포트번호 3306
			user:'root',
			password:'',
			database:'jaeseok'
		});
		
		connection.connect(function(err){
			if(err){
				console.log('mysql connection error');
				console.log(err);
				throw err;
			}
		});
		
		//sql 실행
		connection.query('select * from goods where itemid=?',
				itemid,
				function(err, results, fields){
			//에러가 있으면 예외를 던지고 빠져나감 
			if(err){
				throw err;
			}
			//검색된 결과가 없으면 
			if(results.length == 0){
				res.json({'result':false});
			//검색된 결과가 있으면
			}else{
				res.json({'result':true, 'item':results[0]});
			}
		});
	}
	
	connection.end();
	
});

//err는 에러가 있을 때 어떻게 처리해야할 지 설정 
//데이터가 업데이트 된 시간을 출력
app.get("/item/date", (req, res, next) => {
	fs.readFile('./update.txt', function(err, data){
		res.json({'result': data.toString()});
	});
});


//post 방식에서 파라미터를 처리할 수 있도록 설정
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:true
}));

//삭제 요청 처리
app.post("/item/delete", (req, res, next)=>{

	//파라미터 읽기
	const itemid = req.body.itemid;
	if(itemid == undefined){
		res.json({'result':false});
	}else{
		var connection = mysql.createConnection({
			host:'localhost',
			port:'3306',
			user:'root',
			password:'',
			database:'jaeseok'			
			
		});
		
		connection.connect(function(err){
			if(err){
				console.log('mysql connection error');
				console.log(err);
				throw err;
			}
		});
		
		connection.query('delete from goods where itemid = ?',
				itemid,
				function(err, results, field){
				if(err){
					throw err;
				}
				//결과 확인
				console.log(results);
				
				if(results.affectedRows > 0 ){
					//현재 시간을 update.txt 파일에 기록
					const writeStream = fs.createWriteStream('./update.txt');
					writeStream.write(Date.now().toString());
					writeStream.end();
					res.json({'result':true})
				}else{
					
					res.json({'result':false})
				}
		});
	}
	
	connection.end();
	
});

//item/delete 요청이 get 방식으로 오면 views 디렉토리의 delete.html을 출력 
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.get("/item/delete", (req, res, next)=>{
	res.render('delete');
})

//파일 업로드를 위한 처리
try{
	fs.readdirSync('img');
}catch(error){
	console.log('img 디렉토리가 없어서 생성합니다.');
	fs.mkdirSync('img');
}

const upload = multer({
	storage:multer.diskStorage({
		//파일의 목적지 설정 
		destination(req, file, done){
			done(null, 'img/');
		},
		//파일이름 설정 
		filename(req, file, done){
			const ext = path.extname(file.originalname);
			done(null, path.basename(file.originalname, ext) + 
					Date.now() + ext);
		},
		//파일의 크기 
	}), limits:{ filesize:10 * 1024 * 1024},
});

//1개의 파일을 업로드 하는 아이템 삽입 작업
app.post('/item/insert', upload.single('pictureurl'),
		(req, res, next)=>{
		//파라미터 읽기
		const itemname = req.body.itemname;
		const price = req.body.price;
		const description = req.body.description;
		
		var pictureurl;
		//파일 파라미터 읽기
		if(req.file){
			pictureurl= req.file.filename;
		}else{
			pictureurl = 'default.jpg';
		}
		
		var connection = mysql.createConnection({
			host:'localhost',
			port:3306,
			user:'root',
			password:'',
			database:'jaeseok'			
			
		});
		

		connection.connect(function(err){
			if(err){
				console.log('mysql connection error');
				console.log(err);
				throw err;
			}else{
				console.log("접속");
			}
		});
		var itemid;
		//가장 큰 itemid 찾기 
		connection.query('select max(itemid) maxid from goods',
				function(err, results, field){
			if(err){
				throw err;
			}
			//itemid가 가장 큰 것을 찾아서 있으면 itemid 는 +1
			//없으면 1
			
			if(results.length > 0){
				itemid = results[0].maxid + 1;
			}else{
				itemid = 1;
			}
			
			//현재 시간을 이용해서 날짜와 시간 문자열 만들기 
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth() + 1 ;
			month = month >= 10 ? month : "0" + month;
			var day = date.getDate();
			day = day >= 10 ? day : "0" + day;
			var hour = date.getHours();
			hour = hour >= 10 ? hour : "0"+hour;
			var minute = date.getMinutes();
			minute = minute >= 10 ? minute : "0"+minute;
			var second = date.getSeconds();
			second = second >= 10 ? second : "0"+second;
			
			
			
			connection = mysql.createConnection({
				host:'localhost',
				port:3306,
				user:'root',
				password:'',
				database:'jaeseok'			
				
			});
			

			connection.connect(function(err){
				if(err){
					console.log('mysql connection error');
					console.log(err);
					throw err;
				}else{
					console.log("접속");
				}
			});
			
			
			connection.query('insert into goods(itemid, itemname, price, description, pictureurl, updatedate) values(?,?,?,?,?,?)',
						[itemid, itemname, price, description, pictureurl, year+'-'+month+'-'+day],
							function(err, results, fields){
						if(err){
							console.log(err.message);
							throw err;
						}
						if(results.affectedRows > 0){
							//데이터 삽입된 시간을 update.txt 파일에 기록 
							const writeStream = fs.createWriteStream("./update.txt");
							writeStream.write(year+"-"+"-"+day+" "+hour+":"+minute+":"+second);
							writeStream.end();
							res.json({"result":true});
						}else{
							res.json({"result":false});
						}
					})
		});
			
		
		
		
});

//이미지 다운로드 
var util = require('util');
var mime = require('mime');

//주소를 사용할 수 없어서 :   //미들웨어 필요없어서 
app.get('/img/:fileid', function(req, res){
	//img 경로 뒤에 붙은 내용을 가져오기
	var fileid = req.params.fileid;
	//실제 파일 경로를 설정
	var file = '/Users/a202_09/node/mysqlserver/img' + '/' + fileid;
	
	//파일 다운로드 설정
	mimetype = mime.lookup(fileid);
	res.setHeader('Content-disposition', 'attachment; filename =' + fileid);
	var filestream = fs.createReadStream(file);
	filestream.pipe(res);
})

//item/insert요청이 오면 views 디렉토리에 insert.html을 출력 
app.get('/item/insert', (req, res, next)=>{
	res.render('insert');
});

//미들웨어 장착
app.use((err, req, res, next) => {
	console.error(err)
	res.status(500).send(err.message)
})

//서버 실행
app.listen(app.get('port'), () => {
	console.log(app.get('port'), '번에서 서버 구동 중')
})