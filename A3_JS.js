$(function () {
	var socket = io();
	var clientName = '';
	var cookieCounter = 0;
	
	
	var tempCookie = false;
	
	if (document.cookie.split(';').filter(function(item) {
		return item.trim().indexOf('ClientName=') == 0
	}).length) {
    //console.log('The cookie "ClientName" exists (ES5)')
	tempCookie = true;
	}
	
	
	
	socket.emit('cookie test', tempCookie);

	$('form').submit(function(e){
		e.preventDefault(); // prevents page reloading
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});
				
	/*
	socket.on('chat message', function(msg){
		$('#messages').append($('<li>').text(msg));
		//$('#messages').append($('<p>').text(msg));	
	});
	*/
				
				
	socket.on('getCurrentUser', function(msg){
		//location.reload();
		$('#currentUser').empty();
		
		
		var cookieExist = false;
		if (document.cookie.split(';').filter(function(item) {
			return item.trim().indexOf('ClientName=') == 0
		}).length) {
			// console.log('The cookie "ClientName" exists (ES5)')
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
				//clientName = msg;
				document.cookie = "ClientName="+msg+";max-age="+600;
			}
		}	
		clientName = msg;
		$('#currentUser').append($('<p>').text("\n\n\tYou are user: "+msg));
	});
				
	socket.on('changeUsername',function(msg) {
		var time = msg.time;
		var name1 = msg.name1;
		var name2 = msg.name2;
		var toDisplay = '';
					
		if (clientName === name1){
			name1 = name1.bold();
			name2 = name2.bold();
		}
					
		toDisplay = time + "\t" + name1 + " changed to " + name2;
		$('#messages').append($('<li>').html(toDisplay));
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
				toDisplay = x + "\t" + y.bold() + "\t" + z.bold();
			}
			else if (z.includes(" changed to ")===true){
				toDisplay = x + "\t" + y.italics() + "\t" + z.italics();
			}
			else{
				toDisplay = x + "\t" + y + "\t" + z;
			}
					
			//toDisplay = x.bold() + "\t" + y.bold() + "\t" + z.bold();
			$('#messages').append($('<li>').html(toDisplay));
					
		}
					
		//toDisplay = time + "\t" + name + "\t" + message;
		//$('#messages').append($('<li>').html(toDisplay));
	});
				
				
	socket.on('eventToClient',function(msg) {
		// do something with data
		var time = msg.time;
		var name = msg.name; // here, it should be data.name instead of data.username
		var message = msg.message;
		var toDisplay = '';
					
		if (clientName === name){
			//time = time.bold();
			name = name.bold();
			message = message.bold();
		}
					
		toDisplay = time + "\t" + name + "\t" + message;
					
					
		console.log("Test:\t" + time + "\t" + name + "\t" + message);
		$('#messages').append($('<li>').html(toDisplay));
	});
				
				
				
	socket.on('usernames', function(msg){
		$('#userlists').empty();
		var html = '';
		for (i=0; i<msg.length; i++){
			html += msg[i] + "\t";
			$('#userlists').append($('<li>').text(msg[i]));
		}
		//$('#userlists').append($('<li>').text(html));
		console.log("test this shit:  "+html);
	});
							
});