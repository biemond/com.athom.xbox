"use strict";

const Homey = require('homey');
const XboxOn = require('xbox-on');

const xbox_options = {
    tries: 10,
    delay: 1000,
    waitForCallback: true
};

class XboxDevice extends Homey.Device {

  onInit(){
    // Perform default logging of device
    this.log('device init');
    this.log('name:', this.getName());
    this.log('class:', this.getClass());

    // Register homey default capability onoff
    this.registerCapabilityListener('button', this.onCapabilityButton.bind(this));
    
  }

  // this method is called when the Device is added
  onAdded() {
      this.log('xbox added');
  }

  // this method is called when the Device is deleted
  onDeleted() {
      this.log('device deleted');
  }

  // this method is called when the Device has requested a state change (turned on or off)
  onCapabilityButton( value, opts, callback) {
    this.log("Xbox one button press");

    let settings = this.getSettings();

    try {

      let xbox = new XboxOn( settings['address'], settings['live_id'] );
      this.log("Created xbox object ["+settings['address']+"] ("+settings['live_id']+")");

      xbox.powerOn( xbox_options, ( err ) => {

        if( err ) {
          this.log('Xbox powerOn failed: ', err)
          return Promise.reject( err );
        }

        // Then, emit a callback ( err, result )
        this.log('Xbox powerOn succeeded')
        return Promise.resolve();
      });

    } catch( err ) {
      // or, return a Promise
      this.log('Xbox powerOn unknown error: ', err)
      return Promise.reject( err );
    }
  }
}

module.exports = XboxDevice;
