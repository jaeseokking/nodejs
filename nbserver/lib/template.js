module.exports = {
	HTML:function(){
		return`
			<!doctype html>
		    <html>
		    <head>
		      <title>메인화면</title>
		      <meta charset="utf-8">
		    </head>
		    <body>
		      <form>
		      	<table>
		      		<tr>
		      			<td align="center">아이디  </td>
		      			<td><input type="text" name="id"></td>
		      		</tr>     
		      		<tr>	
		      			<td>비밀번호  </td>
		      			<td><input type="password" name="pw"></td>
		      		</tr>
		      	</table>
		      	<input type="submit" value="로그인">
		      	<input type="button" value="회원가입" 
		      	onClick="location.href='${}/join'">
		      </form>
		    </body>
		    </html>
		    `
		},
	join:function(){
		return`
		<!doctype html>
	    <html>
	    <head>
	      <title>회원가입</title>
	      <meta charset="utf-8">
	    </head>
	    <body>
	      <form>
	      	<table>
	      		<tr>
	      			<td align="center">아이디  </td>
	      			<td><input type="text" name="id"></td>
	      		</tr>     
	      		<tr>	
	      			<td>비밀번호  </td>
	      			<td><input type="password" name="pw"></td>
	      		</tr>
	      	</table>
	      	<input type="submit" value="회원가입">
	      </form>
	    </body>
	    </html>
	    `
		
	}
}