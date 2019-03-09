$(function () {
	var socket = io();
	var clientName = '';
	var cookieCounter = 0;
	var indexCounter = 0;
	var colorHex = "#000000";
	var tempList = [];
	
	var tempCookie = false;
	if (document.cookie.split(';').filter(function(item) {
		return item.trim().indexOf('ClientName=') == 0
	}).length) {
	tempCookie = true;
	}
	socket.emit('cookie test', {cookieStatus: tempCookie, cookieName: document.cookie.replace(/(?:(?:^|.*;\s*)ClientName\s*\=\s*([^;]*).*$)|^.*$/, "$1")});

	
	$('form').submit(function(e){
		e.preventDefault(); // prevents page reloading
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});		
				
	socket.on('getCurrentUser', function(msg){
		//location.reload();
		$('#currentUser').empty();
		var cookieExist = false;
		if (document.cookie.split(';').filter(function(item) {
			return item.trim().indexOf('ClientName=') == 0
		}).length) {
			cookieExist = true;
		}
	
		if (cookieExist === false && cookieCounter === 0){
			cookieCounter = 1;
			//clientName = msg;
			document.cookie = "ClientName="+msg+";max-age="+600;
		}
		else{
			var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)ClientName\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			if (cookieValue === clientName){
				document.cookie = "ClientName="+msg+";max-age="+600;
			}
		}	
		clientName = msg;
		$('#currentUser').append($('<p>').text("\n\n\tYou are user: "+msg));
	});	
	
	socket.on('cookieUserBUG',function(msg) {
		var previous = msg.previous;
		var changed = msg.changed;
		if (clientName === previous){
			$('#currentUser').empty();
			clientName = changed;
			$('#currentUser').append($('<p>').text("\n\n\tYou are user: "+clientName));
		}
	});
	
	socket.on('changeColor',function(msg) {
		var checkUSER = msg.name;
		var checkColor =msg.colorTemp;
		
		if (clientName === checkUSER){
			colorHex = checkColor;
		}
	});
				
	socket.on('loadChatLog',function(msg) {
		$('#messages').html('');
		var time = msg.time;
		var name = msg.name; // here, it should be data.name instead of data.username
		var message = msg.message;
		var toDisplay = '';
		
					
					
		for(var i = 0; i<time.length;i++){
			//console.log(storeTime[i] + "\t" + storeUser[i] + "\t" + storeMessage[i]);
			var x = time[i];
			var y = name[i];
			var z = message[i];
			
			
			if (clientName === y){
				y = y.fontcolor(colorHex);
				toDisplay = x.bold() + "\t" + y.bold() + "\t" + z.bold();
			}
			else if (z.includes(" changed to ")===true && z.includes(clientName)===true){
				z = z.fontcolor(colorHex);
				x = x.bold();
				y = y.bold();
				z = z.bold();
				toDisplay = x.italics() + "\t" + y.italics() + "\t" + z.italics();
			}
			else if (z.includes(" changed to ")===true){
				toDisplay = x.italics() + "\t" + y.italics() + "\t" + z.italics();
			}
			else{
				toDisplay = x + "\t" + y + "\t" + z;
			}
					
			//toDisplay = x.bold() + "\t" + y.bold() + "\t" + z.bold();
			var temp = i + 1;
			$('#messages').append($('<li>').html(temp+": "+toDisplay));
					
		}
		indexCounter = time.length;
		console.log("IndexCOunter: "+indexCounter);
	});
				
				
	socket.on('eventToClient',function(msg) {
		// do something with data
		var time = msg.time;
		var name = msg.name; // here, it should be data.name instead of data.username
		var message = msg.message;
		var toDisplay = '';
					
		if (clientName === name){
			name = name.fontcolor(colorHex);
			time = time.bold();
			name = name.bold();
			message = message.bold();
		}
					
		toDisplay = time + "\t" + name + "\t" + message;
								
		console.log("Test:\t" + time + "\t" + name + "\t" + message);
		
		var temp = indexCounter+1;
		indexCounter = temp;
		console.log("IndexCOunter: "+indexCounter);
		$('#messages').append($('<li>').html(temp+": "+toDisplay));
	});
	
				
	socket.on('usernames', function(msg){
		$('#userlists').empty();
		var html = [];
		for (i=0; i<msg.length; i++){
			html.push(msg[i])
		}
		
		for(var x = 0; x < html.length;x++){
			if (tempList.includes(html[x])===false){
				tempList.push(html[x]);
			}
		}
		for(var z = 0; z<tempList.length;z++){
			$('#userlists').append($('<li>').text(tempList[z]));
		}
		console.log("test this shit:  "+html);
		console.log("fuck this shit:  "+tempList);
	});
							
});