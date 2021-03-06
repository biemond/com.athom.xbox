"use strict"; 

const Homey = require('homey');
const XboxOn = require('xbox-on');

const xbox_options = {
    tries: 5,
    delay: 100,
    waitForCallback: false
  };

class XboxDriver extends Homey.Driver {

  onInit() {
    this.log("onInit XboxDriver");

    this._initFlow();
  }

  _initFlow(){
    this.log("init Flows");
  }


  onPair( socket ) {
    this.log("onPair");

    socket.on('validate', ( data, callback ) => {

      try {
        this.log("Validating new XboxOne");

        let xbox = new XboxOn( data.address, data.live_id );

        xbox.powerOn( xbox_options, ( err ) => {

          if( err ) return Promise.reject( err );

          // Then, emit a callback ( err, result )
          callback();
        });

      } catch( err ) {
        return Promise.reject( err );
      }

    });
  }

}

module.exports = XboxDriver;
