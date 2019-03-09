var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userTemp = -1;
var allUsernames = [];
var existedUsername = [];

var storeTime = [];
var storeUser = [];
var storeMessage = [];

// route handler which i called when we hit main page
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/A3_CSS.css',function(req, res){
	res.sendFile(__dirname + '/A3_CSS.css')
});

app.get('/A3_JS.js',function(req, res){
	res.sendFile(__dirname + '/A3_JS.js')
});

// user interaction
io.on('connection', function(socket){
	console.log('a user connected\n');
	
	var tempUser = "";

	socket.on('cookie test', function(msg){
		var cookieStatus = msg.cookieStatus;
		var cookieName = msg.cookieName;
		
		
		if (cookieStatus===false){
			tempUser = "User"+userTemp;
			console.log("NewUSER:\t"+userTemp);
			socket.username = tempUser;
			existedUsername.push(socket.username);
			console.log("New client ID:\t"+socket.id);
		}
		else{
			tempUser = cookieName;
			socket.username = tempUser;
		}
		
		allUsernames.push(socket.username);
		
		
		console.log("Username check:\t"+tempUser);
		io.to(socket.id).emit('getCurrentUser',socket.username);
		io.emit('usernames',allUsernames);	
		io.to(socket.id).emit('loadChatLog', { time: storeTime, name: storeUser, message: storeMessage });
		console.log('All usernames : '+ allUsernames + "\n\n\n"); // user checks
	});


	socket.on('chat message', function(msg){
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
				io.emit('eventToClient', { time: temp, name: socket.username, message: "New nickname is not unique" });
				storeTime.push(temp);
				storeUser.push(socket.username);
				storeMessage.push("Inputted nickname already taken!!!");
			}
			// swap to new username
			else{
				io.to(socket.id).emit('getCurrentUser',userSplit);
				io.emit('cookieUserBUG',{previous: socket.username, changed: userSplit});
				for(var i = 0; i<allUsernames.length;i++){
					if(allUsernames[i]===socket.username){
						allUsernames[i] = userSplit;
					}
				}
			  
				for(var i = 0; i<storeUser.length;i++){
					if(storeUser[i]===socket.username){
						storeUser[i] = userSplit;
					  //socket.username = userSplit;
					}
				}
			  
			  
				var toDisplay = socket.username + " changed to " + userSplit;
				var temp = getCurrentTime();
				storeTime.push(temp);
				storeUser.push(" ");			  
				storeMessage.push(toDisplay);
			  
				console.log("\n\nLOG test");
				for(var i = 0; i<storeTime.length;i++){
					console.log(storeTime[i] + "\t" + storeUser[i] + "\t" + storeMessage[i]);
					//io.to(socket.id).emit('loadChatLog', { time: storeTime[i], name: storeUser[i], message: storeMessage[i] });
				}
				io.emit('loadChatLog', { time: storeTime, name: storeUser, message: storeMessage });
				
				console.log("\n\nChange 1: user:\t"+socket.username);
				console.log("Change 2: user:\t"+userSplit+"\n\n");
				
				
			 
				socket.username = userSplit;
				existedUsername.push(socket.username);
				//io.sockets.emit('refresh', msg);
			}

		}
	  
	  // reply different message
		else if(msg.includes(colorCheck) === true && spaceCount === 1 && msg[0]==="/" && msg.indexOf("nickcolor")===1 && colorSplit.length===7){
			console.log("\n\nCOLORS WORRRRRRRKSSSSSSSSSS\n\n");
			console.log("colorSplit:\t"+colorSplit);
			console.log("colorSplit length"+colorSplit.length);
			console.log("msg length"+msg.length);
			
			var temp = getCurrentTime();
			storeTime.push(temp);
			storeUser.push(socket.username);
			storeMessage.push(msg);
			io.emit('changeColor',{name: socket.username, colorTemp: colorSplit})
			io.emit('loadChatLog', { time: storeTime, name: storeUser, message: storeMessage });
			
			
		}
		else if (msg.length !== 0 && msg.replace(/\s/g, '').length !== 0){
			var temp = getCurrentTime();
			storeTime.push(temp);
			storeUser.push(socket.username);
			storeMessage.push(msg);
			io.emit('eventToClient', { time: temp, name: socket.username, message: msg });
		}

		io.emit('usernames',allUsernames);
		console.log('All usernames : '+ allUsernames + "\n\n\n"); // user checks
	});
  
  
	socket.on('disconnect', function(){
		allUsernames.splice(allUsernames.indexOf(socket.username), 1);
		console.log('user disconnected');
		io.emit('usernames',allUsernames);
		console.log('All usernames : '+ allUsernames + "\n\n\n"); // user checks
	});
  
  
	// random user generation increment
	userTemp = userTemp + 1;
	console.log('All usernames : '+ allUsernames + "\n\n\n"); // user checks
	io.emit('usernames',allUsernames);
});


// listen on port 3000
http.listen(3000, function(){
	console.log('listening on *:3000');
});


function getCurrentTime() {
	var d = new Date();
	var n = d.toLocaleTimeString();
	return n;
}