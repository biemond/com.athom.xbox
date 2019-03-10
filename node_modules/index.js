
(function () {

    // main settings
    var http = require('http.min');
    var options = {
        protocol: 'https:',
        hostname: 'xboxapi.com',
        path: '/dummy',
        headers: {}
    };

    var xboxapi = exports;

    // active functions()  -------------------------------------  active functions()  --------------------------------------------

    xboxapi.getUser = function getUser(apikey) {
        let url = '/v2/accountxuid';

        return new Promise((resolve, reject) => {
            getData(url, apikey, (error, jsonobj) => {
                if (jsonobj) {
                    resolve(jsonobj);
                } else {
                    reject(error);
                }
            });
        });
    }

    xboxapi.getFriends = function getFriends(settings) {
        let url = '/v2/' + settings.userId + '/friends';

        return new Promise((resolve, reject) => {
            getData(url, settings.apikey, (error, jsonobj) => {
                if (jsonobj) {
                    resolve(jsonobj);
                } else {
                    reject(error);
                }
            });
        });
    }

    xboxapi.getFriendCurrentData = function getFriendCurrentData(settings) {
        let url = '/v2/' + settings.id + '/presence';

        return new Promise((resolve, reject) => {
            getData(url, settings.apikey, (error, jsonobj) => {
                if (jsonobj) {
                    resolve(jsonobj);
                } else {
                    console.log("problem with request: "+ error);
                    reject(error);
                }
            });
        });
    }

    function getData(url, token, callback) {
        options.path = url;
        options.headers = {
            'User-Agent': 'Node.js http.min',
            'Accept': 'application/json',
            'X-AUTH': token
        };

        console.log('url ' + url);
        http.json(options).then(data => {
                //this.log(data)
                return callback(null, data);
            })
            .catch(err => {
                console.log("problem with request: ${err.message}");
            });
    }

})();
