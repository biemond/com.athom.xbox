const Homey = require('homey');

class MyXBOXApp extends Homey.App {
	
	async onInit() {
		this.log('MyXBOXApp is running...');
	}
	
}

module.exports = MyXBOXApp;