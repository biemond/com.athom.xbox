'use strict';

const Homey = require('homey');
const { ManagerSettings } = require('homey');
const xboxapi = require('./index.js');

Date.prototype.timeNow = function(){ 
    return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + " " + ((this.getHours()>12)?('PM'):'AM');
};

class MyXBOXFriendDevice extends Homey.Device {
	
	onInit() {
		this.log('MyXBOXFriendDevice has been inited');

        let settings = this.getData();
        let apikey = ManagerSettings.get('apikey')
		console.log("key " + apikey);
        settings.apikey = apikey;
        console.log("settings " +  JSON.stringify(settings));
        let cronName = this.getData().id;
 
        Homey.ManagerCron.getTask(cronName)
            .then(task => {
                this.log("The task exists: " + cronName);
                this.log('Unregistering cron:', cronName);
                Homey.ManagerCron.unregisterTask(cronName, function (err, success) {});
                Homey.ManagerCron.registerTask(cronName, "*/10 * * * *", settings)
                .then(task => {
                    task.on('run', settings => this.pollXboxFriendDevice(settings));
                })
                .catch(err => {
                    this.log('problem with registering cronjob: ${err.message}');
                });            
            })
            .catch(err => {
                if (err.code == 404) {
                    this.log("The task has not been registered yet, registering task: " + cronName);
                    Homey.ManagerCron.registerTask(cronName, "*/10 * * * *", settings)
                        .then(task => {
                            task.on('run', settings => this.pollXboxFriendDevice(settings));
                        })
                        .catch(err => {
                            this.log('problem with registering cronjob: ${err.message}');
                        });
                } else {
                    this.log('other cron error: ${err.message}');
                }
            });

        this.pollXboxFriendDevice(settings);
        this._flowTriggerIsOnline = new Homey.FlowCardTrigger('IsOnline').register();
        this._flowTriggerIsOffline = new Homey.FlowCardTrigger('IsOffline').register();

        this._conditionIsOnline = new Homey.FlowCardCondition('is_online').register().registerRunListener((args, state) => {
            let result = this.getCapabilityValue('onoff') 
            return Promise.resolve(result);
        }); 
    }

    // flow triggers
    flowTriggerIsOnline(tokens) {
        this._flowTriggerIsOnline
            .trigger(tokens)
            .then(this.log("flowTriggerIsOnline"))
            .catch(this.error)
    }
    flowTriggerIsOffline(tokens) {
        this._flowTriggerIsOffline
            .trigger(tokens)
            .then(this.log("flowTriggerIsOffline"))
            .catch(this.error)
    }


    onDeleted() {

        let id = this.getData().id;
        let name = this.getData().id;
        let cronName = name;
        this.log('Unregistering cron:', cronName);
        Homey.ManagerCron.unregisterTask(cronName, function (err, success) {});
        this.log('device deleted:', id);

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

                    if ( this.getCapabilityValue('onoff') == true && data.state == 'Offline' ) {
                        this.flowTriggerIsOffline(tokens);
                    }
                    if ( this.getCapabilityValue('onoff') == false && data.state == 'Online' ) {
                        this.flowTriggerIsOnline(tokens);
                    }
                    if (data.state == 'Offline') {
                        this.setCapabilityValue('onoff', false);
                        this.setCapabilityValue('last_seen_date',data.lastSeen.timestamp);
                    } else {
                        this.setCapabilityValue('onoff', true);
                        if (data.devices[0].titles[1] != null) {
                            this.setCapabilityValue('last_seen_date',data.devices[0].titles[1].lastModified.substring(11,24));
                            this.setCapabilityValue('activity', data.devices[0].titles[1].name);
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