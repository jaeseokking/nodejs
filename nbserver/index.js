var http = require('http');
var url = require('url');
var mysql = require('mysql');
var template = require('./lib/template');

var app = http.createServer(function(request, response){
	var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
	
    if(pathname === '/'){
    	if(queryData.id === undefined){
    		
    		
    		response.writeHead(200);
    		response.end(html);
    	}else if(queryData.id === 'join'){
    		var html = template.join();
    		
    		response.writeHeda(200);
    		response.end(html);
    	}
    	
	}
	
});
app.listen(3000);