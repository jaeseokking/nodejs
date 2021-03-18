//웹 서버 모듈
const http = require('http');
//파일 처리 모듈 
const fs = require('fs').promises;

//서버 생성 
http.createServer(async(req, res) => {
	try{
		const data = await
		// ./는 현재 디렉토리 
		fs.readFile('./server.html'); //가져오고 
		res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'}) //출력 형태
		res.end(data) //출력하기 
	}catch(err){
		console.error(err);
		res.writeHead(500, {'Content-Type':'text/plain; charset=utf-8'});
		res.end(err.message);
	}
	//listen : 구동 
}).listen(8081, () => {
	console.log("서버 구동 중...")
})