const Homey = require('homey');
const xboxapi = require('./index.js');

const RETRY_INTERVAL = 300 * 1000;
let timer;

Date.prototype.timeNow = function(){ 
    return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + " " + ((this.getHours()>12)?('PM'):'AM');
};

class MyXBOXFriendDevice extends Homey.Device {
	
    async onInit() {
		this.log('MyXBOXFriendDevice has been inited');

        let settings = this.getData();
        let apikey = this.homey.settings.get('apikey');
		console.log("key " + apikey);
        settings.apikey = apikey;
        console.log("settings " +  JSON.stringify(settings));
 
        timer = this.homey.setInterval(() => {
            // poll device state from invertor
            this.pollXboxFriendDevice(settings);
          }, RETRY_INTERVAL);

        this.pollXboxFriendDevice(settings);
        // this._flowTriggerIsOnline = this.homey.flow.getDeviceTriggerCard('IsOnline').register();
        // this._flowTriggerIsOffline = this.homey.flow.getDeviceTriggerCard('IsOffline').register();

        this._conditionIsOnline = this.homey.flow.getConditionCard('is_online').registerRunListener((args, state) => {
            let result = this.getCapabilityValue('onoff') 
            return Promise.resolve(result);
        }); 
    }

    // flow triggers
    // flowTriggerIsOnline(tokens) {
    //     this._flowTriggerIsOnline
    //         .trigger(tokens)
    //         .then(this.log("flowTriggerIsOnline"))
    //         .catch(this.error)
    // }
    // flowTriggerIsOffline(tokens) {
    //     this._flowTriggerIsOffline
    //         .trigger(tokens)
    //         .then(this.log("flowTriggerIsOffline"))
    //         .catch(this.error)
    // }

    async onAdded() {
        this.log('MyXBOXFriendDevice has been added');
    }

    async onSettings({ oldSettings: { }, newSettings: { }, changedKeys: { } }) {
        this.log('MyXBOXFriendDevice settings where changed');
    }

    async onRenamed(name) {
        this.log('MyXBOXFriendDevice was renamed');
    }

    async onDeleted() {
        this.log('MyXBOXFriendDevice has been deleted');
        this.homey.clearInterval(timer);
    } // end onDeleted

	pollXboxFriendDevice(settings) {
		xboxapi.getFriendCurrentData(settings).then(data => {
            let currentdate =new Date().timeNow();
			this.log("refresh now " + currentdate);
			console.log("Received data " + JSON.stringify(data));
            if (data != null){
                // console.log("last date " +  strUpdateDate.substring(11,24));
                if (data != null){
                    let tokens = {
                        "friend": settings.name
                    };

                    // if ( this.getCapabilityValue('onoff') == true && data.state == 'Offline' ) {
                    //     this.flowTriggerIsOffline(tokens);
                    // }
                    // if ( this.getCapabilityValue('onoff') == false && data.state == 'Online' ) {
                    //     this.flowTriggerIsOnline(tokens);
                    // }

                    // [
                    //     {
                    //       "xuid": "2533274862124205",
                    //       "state": "Offline",
                    //       "lastSeen": {
                    //         "deviceType": "Scarlett",
                    //         "titleId": "750323071",
                    //         "titleName": "Home",
                    //         "timestamp": "2023-03-09T21:53:41.5823197Z"
                    //       }
                    //     }
                    //   ]

                    // {
                    //     "xuid": "2533274936433615",
                    //     "state": "Online",
                    //     "devices": [
                    //       {
                    //         "type": "Scarlett",
                    //         "titles": [
                    //           {
                    //             "id": "750323071",
                    //             "name": "Home",
                    //             "placement": "Background",
                    //             "state": "Active",
                    //             "lastModified": "2023-03-10T20:25:47.1028408Z"
                    //           },
                    //           {
                    //             "id": "2001700854",
                    //             "name": "Call of Duty®: Modern Warfare® II",
                    //             "placement": "Full",
                    //             "state": "Active",
                    //             "lastModified": "2023-03-10T20:25:47.1028408Z"
                    //           }
                    //         ]
                    //       }
                    //     ]

                    if (data[0].state == 'Offline') {
                        this.setCapabilityValue('onoff', false);
                        this.setCapabilityValue('last_seen_date',data[0].lastSeen.timestamp.substring(0,16));
                    } else {
                        this.setCapabilityValue('onoff', true);
                        if (data[0].devices[0].titles[1] != null) {
                            this.setCapabilityValue('last_seen_date',data[0].devices[0].titles[1].lastModified.substring(0,16));
                            this.setCapabilityValue('activity', data[0].devices[0].titles[1].name);
                        } else {
                            this.setCapabilityValue('last_seen_date',"");
                        }
                    }

                    this.setCapabilityValue('latest_update_date', currentdate);
                }
            }
		})
	}
}

module.exports = MyXBOXFriendDevice;