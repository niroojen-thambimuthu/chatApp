/*
*	Niroojen Thambimuthu 10153928
*	Seng513 A3 - Server-side JavaScript file
*	March 11, 2019
*	
*	index.js
*/


// Variables declaration
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userTemp = -1;
var allUsernames = [];
var existedUsername = [];
var existedColors = [];
var storeTime = [];
var storeUser = [];
var storeMessage = [];
var storeColor = [];


// load html page to client page
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

// load css page to client page 
app.get('/A3_CSS.css',function(req, res){
	res.sendFile(__dirname + '/A3_CSS.css')
});

// load client side javascript to client page
app.get('/A3_JS.js',function(req, res){
	res.sendFile(__dirname + '/A3_JS.js')
});

// user interaction
io.on('connection', function(socket){
	console.log('a user connected\n');
	
	// set username and usercolor
	var tempUser = "";
	var colorHexValue = "#000000";

	
	/*
	*	Algorithm to receive cookie data from connecting client 
	*/
	socket.on('cookie test', function(msg){
		// load cookie data
		var cookieStatus = msg.cookieStatus;
		var cookieName = msg.cookieName;
		var nameColor = msg.userColor;
		
		// if user cookie doesn't exist
		if (cookieStatus===false){
			tempUser = "User"+userTemp;
			socket.username = tempUser;
			existedUsername.push(socket.username);
		}
		// when user cookie exist
		else{
			// set same username and user color
			tempUser = cookieName;
			socket.username = tempUser;
			colorHexValue = nameColor;
		}
		// push client username
		allUsernames.push(socket.username);
		
		// emit clientname and log to connecting client
		// send usernamelist to all connected clients to update
		io.to(socket.id).emit('getCurrentUser',socket.username);
		io.emit('usernames',allUsernames);	
		io.to(socket.id).emit('loadChatLog', { time: storeTime, name: storeUser, message: storeMessage, color: storeColor});
	});
	
	
	/*
	*	Implementation to receive usernamebug for tabs in a browser
	*/
	socket.on('username BUG',function(msg) {
		socket.username = msg;
	});

	
	/*
	*	Implementation to receive username color for tabs in a browser
	*/
	socket.on('color BUG',function(msg) {
		colorHexValue = msg;
	});
	

	/*
	*	Implementation to receive client message 
	*/
	socket.on('chat message', function(msg){
		
		// checks variabels
		var userCheck = "/nick";
		var colorCheck = "/nickcolor";
		var spaceCount = (msg.split(" ").length - 1);
		var userSplit = msg.substring(userCheck.length+1,msg.length);
		var colorSplit = msg.substring(colorCheck.length+1,msg.length);
		
		
		// Check if client wants to change username
		if (msg.includes(userCheck) === true && msg[5]===" " && spaceCount === 1 && msg[0]==="/" && msg.indexOf("nick")===1 && userSplit.length !== 0 && userSplit.replace(/\s/g, '').length !== 0){
			
			// if new username is not unique, output msg
			if (existedUsername.includes(userSplit) === true || userSplit.includes("User") === true){
				var temp = getCurrentTime();
				io.emit('eventToClient', { time: temp, name: socket.username, message: "New nickname is not unique!!!", color: colorHexValue});
				storeTime.push(temp);
				storeUser.push(socket.username);
				storeMessage.push("New nickname is not unique!!!");
				storeColor.push(colorHexValue);
			}
			// swap to new username
			else{
				io.to(socket.id).emit('getCurrentUser',userSplit);
				io.emit('cookieUserBUG',{previous: socket.username, changed: userSplit});
				
				// change usernames for clients of same username
				for(var i = 0; i<allUsernames.length;i++){
					if(allUsernames[i]===socket.username){
						allUsernames[i] = userSplit;
					}
				}
			  
				// change usernames in log
				for(var i = 0; i<storeUser.length;i++){
					if(storeUser[i]===socket.username){
						storeUser[i] = userSplit;
					}
				}
			  
				// load updated log to all clients
				var toDisplay = socket.username + " changed to " + userSplit;
				var temp = getCurrentTime();
				storeTime.push(temp);
				storeUser.push(" ");			  
				storeMessage.push(toDisplay);
				storeColor.push(colorHexValue);
				io.emit('loadChatLog', { time: storeTime, name: storeUser, message: storeMessage, color: storeColor});
				socket.username = userSplit;
				existedUsername.push(socket.username);
			}
		}
		// Check if client wants to change username color
		else if(msg.includes(colorCheck) === true && spaceCount === 1 && msg[0]==="/" && msg.indexOf("nickcolor")===1 && colorSplit.length===7){
			
			// if new color is not unique, output msg
			if (existedColors.includes(colorSplit) === true){
				var temp = getCurrentTime();
				storeTime.push(temp);
				storeUser.push(socket.username);
				storeMessage.push("Color already exist!!!");
				storeColor.push(colorHexValue);
				io.emit('loadChatLog', { time: storeTime, name: storeUser, message: storeMessage, color: storeColor});
			}
			
			// swap to new username
			else{
				
				// store msg into server log
				colorHexValue = colorSplit;
				var temp = getCurrentTime();
				storeTime.push(temp);
				storeUser.push(socket.username);
				storeMessage.push("Color changed!!!");
				storeColor.push(colorHexValue);
			
				// change username color in log
				for(var i = 0; i<storeUser.length;i++){
						if(storeUser[i]===socket.username){
							storeColor[i] = colorHexValue;
						}
				}
			
				// emit to update client colorcookie and load updated chat log
				existedColors.push(colorHexValue);
				io.emit('changeColor',{name: socket.username, colorTemp: colorSplit})
				io.emit('loadChatLog', { time: storeTime, name: storeUser, message: storeMessage, color: storeColor});	
			}		
		}
		// If simple message from client
		else if (msg.length !== 0 && msg.replace(/\s/g, '').length !== 0){
			
			// emit message to all clients and update log
			var temp = getCurrentTime();
			storeTime.push(temp);
			storeUser.push(socket.username);
			storeMessage.push(msg);
			storeColor.push(colorHexValue);
			io.emit('eventToClient', { time: temp, name: socket.username, message: msg, color: colorHexValue});
		}
		io.emit('usernames',allUsernames);
	});
  
  
	/*
	*	Implementation when user disconnect
	*/
	socket.on('disconnect', function(){
		// remove username from userlist
		allUsernames.splice(allUsernames.indexOf(socket.username), 1);
		console.log('user disconnected');
		// emit to all clients of active users
		io.emit('usernames',allUsernames);
	});
  
  
	// random user generation increment
	userTemp = userTemp + 1;
	io.emit('usernames',allUsernames);
});


// listen on port 3000
http.listen(3000, function(){
	console.log('listening on *:3000');
});


/*
*	Function which returns time as hr:mm:ss
*/
function getCurrentTime() {
	var d = new Date();
	var n = d.toLocaleTimeString();
	return n;
}