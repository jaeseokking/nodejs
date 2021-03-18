//const는 변경 불가 / var는 변경 가능
const fs = require('fs')

console.log('이제 시작')
fs.readFile('./text.txt', (err, data) => {
	if(err != null){
		console.log('에러 발생')
	}else{
		console.log('1번', data.toString())
	}
});

fs.readFile('./text.txt', (err, data) => {
	if(err != null){
		console.log('에러 발생')
	}else{
		console.log('2번', data.toString())
	}
});

fs.readFile('./text.txt', (err, data) => {
	if(err != null){
		console.log('에러 발생')
	}else{
		console.log('3번', data.toString())
	}
});


console.log('여기가 마지막?')