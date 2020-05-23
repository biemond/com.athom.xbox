'use strict';

const Homey = require('homey');
const xboxapi = require('./index.js');
const { ManagerSettings } = require('homey');

Date.prototype.timeNow = function(){ 
	return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + " " + ((this.getHours()>12)?('PM'):'AM');
};

class MyXBOXFriendDriver extends Homey.Driver {
	
	onInit() {
		this.log('MyXBOXFriendDriver has been inited');
	}
	
	onPair( socket ) {
		let devices = []
		let apikey = ManagerSettings.get('apikey')
		this.log("key " + apikey);

		socket.on('list_devices', function( data, callback ) {
			if ( apikey == null ) {
				devices = [];
				// socket.emit('list_devices', devices );
				callback( new Error('Please provide first the apikey in the app settings!') );
			} else {
				// emit when devices are still being searched
				xboxapi.getUser(apikey).then(data2 => {
					console.log("apikey " + apikey);
					console.log("Received data");
					console.log("object "+ JSON.stringify(data2));
					let obj2 = data2;
					console.log("userId: " + obj2.xuid);

					let settings =  { 
							"userId": obj2.xuid,
							"apikey": apikey
						};

					xboxapi.getFriends(settings).then(data => {
						let currentdate =new Date().timeNow();
						console.log("refresh now " + currentdate);
				
						console.log("Received data");
						console.log("object "+ JSON.stringify(data));

						for ( var i = 0; i < data.length; i++) {
							let obj = data[i];
							console.log("object: " + obj);
							console.log("id: " + obj.id);
							console.log("Gamertag: " + obj.Gamertag);

							var device =  { "name": obj.Gamertag,
											"data": {
														"id": obj.id,
														"name": obj.Gamertag,
														"apikey": apikey,
														"userId": obj2.xuid
													}
												};
							devices.push(device);
							console.log(devices);
						}	
						socket.emit('list_devices', devices );
						callback( null, devices );
					})
				})				
				.catch(error => {
						this.log(error);
				});
			}
		});
	}
}

module.exports = MyXBOXFriendDriver;
