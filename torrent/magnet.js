var req = require('request');
var console = require('console');

function magnet( word ){
    var url = "http://torrentproject.com/" + word +'/';
    console.log( 'fetching magnet address...\n' );
    req.get(url, function(err, res, body){
        var reg = /magnet:(.*?)announce'/g;
        var arr = body.match(reg);
        var str = arr[0];
        str = str.substr(0, str.length-1);
        console.log(str + '\n');
    });
}
exports.magnet = magnet;
