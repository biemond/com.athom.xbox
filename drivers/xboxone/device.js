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
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    
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
  onCapabilityOnoff( value, opts, callback) {
    this.log("Turning Onoff: "+value);

    let settings = this.getSettings();

    if (value == true){

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

    } else {
      this.log('Xbox tried powerOff')
      return Promise.reject( new Error('off_not_implemented') );
    } 
  }
}

module.exports = XboxDevice;
