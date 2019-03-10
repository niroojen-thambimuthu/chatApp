/*
*	Niroojen Thambimuthu 10153928
*	Seng513 A3 - Client-side JavaScript file
*	March 11, 2019
*	
*	A3_JS.js
*/

$(function () {
	
	// Variables declaration
	var socket = io();
	var clientName = '';
	var cookieCounter = 0;
	var indexCounter = 0;
	var colorHex = "#000000";
	var cookieCOLOR = false;
	
	
	/*
	*	Algorithm to check whether ColorName cookie exist, 
	*/
	if (document.cookie.split(';').filter(function(item) {
			return item.trim().indexOf('ColorName=') == 0
		}).length) {
		// set check to true if exist
		cookieCOLOR = true;
		}
	// if cookie doesn't exist, preset value with #000000
	if (cookieCOLOR === false){
			document.cookie = "ColorName="+colorHex+";max-age="+600;
	}
	
	
	/*
	*	Algorithm to check whether ClientName cookie exist, 
	*/
	var tempCookie = false;
	if (document.cookie.split(';').filter(function(item) {
		return item.trim().indexOf('ClientName=') == 0
	}).length) {
	// set check to true if exist
	tempCookie = true;
	}
	
	
	/*
	*	 send cookie datas during initial connection
	*/
	var loadNAME = document.cookie.replace(/(?:(?:^|.*;\s*)ClientName\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	var loadColor = document.cookie.replace(/(?:(?:^|.*;\s*)ColorName\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	// emit cookies informations
	socket.emit('cookie test', {cookieStatus: tempCookie, cookieName: loadNAME, userColor: loadColor});

	
	/*
	*	Algorithm to send client message input to server 
	*/
	$('form').submit(function(e){
		e.preventDefault(); // prevents page reloading
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});		
	

	/*
	*	Algorithm to receive or to change client username 
	*/
	socket.on('getCurrentUser', function(msg){
		$('#currentUser').empty();
		// check if cookie exist
		var cookieExist = false;
		if (document.cookie.split(';').filter(function(item) {
			return item.trim().indexOf('ClientName=') == 0
		}).length) {
			cookieExist = true;
		}
		
		// if clientName cookie doesn't exist, make one
		if (cookieExist === false && cookieCounter === 0){
			cookieCounter = 1;
			document.cookie = "ClientName="+msg+";max-age="+600;
		}
		// else change cookie value if username matches
		else{
			var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)ClientName\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			if (cookieValue === clientName){
				document.cookie = "ClientName="+msg+";max-age="+600;
			}
		}	
		clientName = msg;
		// display user what user they are
		$('#currentUser').append($('<p>').text("\n\n\tYou are user: "+msg));
	});	
	
	
	/*
	*	Implementation to overcome username to all tabs in a browser
	*/
	socket.on('cookieUserBUG',function(msg) {
		var previous = msg.previous;
		var changed = msg.changed;
		// emit to all clients, if user=previous user, swap to new user
		if (clientName === previous){
			$('#currentUser').empty();
			clientName = changed;
			$('#currentUser').append($('<p>').text("\n\n\tYou are user: "+clientName));
			// emit to server for all clients 
			socket.emit('username BUG',clientName );
		}
	});
	
	
	/*
	*	Implementation to overcome color change on tabs of same browser
	*/
	socket.on('changeColor',function(msg) {
		var checkUSER = msg.name;
		var checkColor =msg.colorTemp;
		// if client name matches, change colorname cookie value
		if (clientName === checkUSER){
			colorHex = checkColor;
			document.cookie = "ColorName="+colorHex+";max-age="+600;
			var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)ColorName\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			// emit to server for all clients
			socket.emit('color BUG',cookieValue );
		}
	});
	
	
	/*
	*	Algorithm to receive chat log from server when user connects,
	*	change username and change colors
	*/
	socket.on('loadChatLog',function(msg) {
		$('#messages').html('');
		// load stored data from server
		var time = msg.time;
		var name = msg.name; 
		var message = msg.message;
		var colorChange = msg.color
		var toDisplay = '';
		
		// for loop with length of previously stored messages
		for(var i = 0; i<time.length;i++){
			var x = time[i];
			var y = name[i];
			var z = message[i];
			
			// when it's user message
			if (clientName === y){
				y = y.fontcolor(colorChange[i]);
				toDisplay = x.bold() + "\t" + y.bold() + "\t" + z.bold();
			}
			// when it's user's change message
			else if (z.includes("changed")===true && z.includes(clientName)===true){
				z = z.fontcolor(colorChange[i]);
				x = x.bold();
				y = y.bold();
				z = z.bold();
				toDisplay = x.italics() + "\t" + y.italics() + "\t" + z.italics();
			}
			// when it's another user's change message
			else if (z.includes("changed")===true){
				y = y.fontcolor(colorChange[i]);
				z = z.fontcolor(colorChange[i]);
				toDisplay = x.italics() + "\t" + y.italics() + "\t" + z.italics();
			}
			// when it's another user's message
			else{
				y = y.fontcolor(colorChange[i]);
				toDisplay = x + "\t" + y + "\t" + z;
			}
			var temp = i + 1;
			// append message a list a single message at at time
			$('#messages').append($('<li>').html(temp+": "+toDisplay));
					
		}
		indexCounter = time.length;
	});
				
	
	/*
	*	Algorithm to receive message sent by clients from server
	*/
	socket.on('eventToClient',function(msg) {
		// load stored data from server
		var time = msg.time;
		var name = msg.name;
		var message = msg.message;
		var colorChange = msg.color
		var toDisplay = '';
		
		// if client name matches, make bold
		if (clientName === name){
			time = time.bold();
			name = name.bold();
			message = message.bold();
		}
		name = name.fontcolor(colorChange);
		toDisplay = time + "\t" + name + "\t" + message;
								
		var temp = indexCounter+1;
		indexCounter = temp;
		// append new message to list
		$('#messages').append($('<li>').html(temp+": "+toDisplay));
	});
	
	
	/*
	*	Algorithm which Prints out all active users from server
	*/
	socket.on('usernames', function(msg){
		$('#userlists').empty();
		var html = [];
		var tempList = [];
		
		// load all connected users
		for (i=0; i<msg.length; i++){
			html.push(msg[i])
		}
		// load all distinct users
		for(var x = 0; x < html.length;x++){
			if (tempList.includes(html[x])===false){
				tempList.push(html[x]);
			}
		}
		// append distinct active users to userlist
		for(var z = 0; z<tempList.length;z++){
			$('#userlists').append($('<li>').text(tempList[z]));
		}
	});				
});