const Homey = require('homey');
const xboxapi = require('./index.js');

class MyXBOXFriendDriver extends Homey.Driver {
	
	async onInit() {
		this.log('MyXBOXFriendDriver has been inited');
	}
	
	async onPair(session) {

		let apikey = this.homey.settings.get('apikey');
		this.log("key " + apikey);

		session.setHandler("list_devices", async function () {

			if ( apikey == null || apikey == '' ) {
				throw new Error('Please provide first the apikey in the app settings!');
			} else {
				// emit when devices are still being searched
				return xboxapi.getUser(apikey).then(data2 => {
					console.log("apikey " + apikey);
					console.log("Received data");
					console.log("object "+ JSON.stringify(data2));
					let obj2 = data2;
					console.log("userId: " + obj2.profileUsers[0].id);

					let settings =  { 
						"userId": obj2.profileUsers[0].id,
						"apikey": apikey
					};

					let devices = [];
					return xboxapi.getFriends(settings).then(data => {
						console.log("Received data");
						// console.log("object "+ JSON.stringify(data));
                        let friends = data.people;
						for ( var i = 0; i < friends.length ; i++) {
							let obj = friends[i];
							// console.log("object: " + obj);
							// console.log("id: " + obj.xuid);
							console.log("Gamertag: " + obj.gamertag);

							var device =  { "name": obj.gamertag,
											"data": {
														"id": obj.xuid,
														"name": obj.gamertag,
														"apikey": apikey,
														"userId": obj2.profileUsers[0].id
													}
										  };
							devices.push(device);
							// console.log(devices);
						}	
						return devices;
					})
				})				
				.catch(error => {
					this.log(error);
					// throw new error;
				});
			}
		});
	}
}

module.exports = MyXBOXFriendDriver;
