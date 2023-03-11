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

        let conditionIsOnline = this.homey.flow.getConditionCard('is_online');
		conditionIsOnline.registerRunListener((args, state) => {
            const result = this.getCapabilityValue('onoff'); 
            return Promise.resolve(result);
        }); 
    }

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
			this.log("Received data " + JSON.stringify(data));
            if (data != null){
                // console.log("last date " +  strUpdateDate.substring(11,24));
                if (data != null){
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

                    if (data[0].state == 'Offline' || data[0].state == 'Away') {
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

                    let tokens = {
                        "friend": settings.name
                    };

                    this.log(JSON.stringify(data[0]));
                    if ( this.getCapabilityValue('onoff') == true && (data[0].state == 'Offline' || data[0].state == 'Away' ) ) {
                        this.driver.flowTriggerIsOffline(tokens);
                    }
                    if ( this.getCapabilityValue('onoff') == false && data[0].state == 'Online' ) {
                        this.driver.flowTriggerIsOnline(tokens);
                    }                    
                }
            }
		})
	}
}

module.exports = MyXBOXFriendDevice;