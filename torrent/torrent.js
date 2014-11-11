var req = require('request');
var console = require('console');

function torrent( word ){
    var url = "http://torrentproject.com/";
    var data = {
        out : 'json',
        s : word 
    };
    function serilize(obj){
        var arr = [];
        for(var key in obj){
            arr.push( key + '=' + encodeURIComponent(obj[key]) );
        }
        return arr.join('&');
    }

    var fullUrl = url + '?' + serilize(data);
    console.log( 'searching...\n' );
    req.get(fullUrl, function(err, res, body){
        var ret = JSON.parse(body);
        console.log('种子总数：' + ret.total_found);
        var i = '1';
        while( ret[i] && parseInt(i) <= 10 ){
            console.log( i + '==============================================' );
            console.log('  种子标题: ' + ret[i].title );
            console.log('  种子大小: ' + sizeBetter( ret[i].torrent_size ) );
            console.log('  种子hash: ' + ret[i].torrent_hash );
            i = (parseInt(i) + 1).toString();
        }
    });
    function sizeBetter(size){
        if(size > 1024 * 1024 * 1024){
            return (size/1024/1024/1024).toFixed(2) + 'G';
        }else if(size > 1024 * 1024){
            return (size/1024/1024).toFixed(2) + 'M';
        }else{
            return (size/1024).toFixed(2) + 'K';
        }
    }
}
exports.torrent = torrent;
