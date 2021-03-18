//var.js 파일에서 export 한 내용을 odd 와 even 에 저
const {odd, even} = require("./var.js")

function checkOddOrEven(num){
	if(num % 2 == true){
		return odd;
	}else{
		return even;
	}
}

//외부에서 함수를 사용할 수 있도록 하기
module.exports = checkOddOrEven;