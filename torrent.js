var req = require('request');
var console = require('console');
var log4js = require('log4js'),
    logger = log4js.getLogger('trmag');
var Table = require("cli-table");
var cliff = require("cliff");

function torrent( program ){
    var url = "http://torrentproject.se/";
    var data = {
        out : 'json',
        s : program.name || '' 
    };
    var fullUrl = url + '?' + serilize(data);
    logger.info( 'searching...\n' );
    req.get(fullUrl, function(err, res, body){
        if( err ){
            logger.error('errors happen, maybe the network is invalid!');
            return;
        }
        var ret = JSON.parse(body);
        logger.info('种子总数：' + ret.total_found);
        var i = '1';
        var arr = [];
        while( ret[i] && parseInt(i) <= ( program.size || 10 ) ){
            arr.push( ret[i] );
            i = (parseInt(i) + 1).toString();
        }
        showTable( arr );
        //showCliff( arr );
    });
}
function serilize(obj){
    var arr = [];
    for(var key in obj){
        arr.push( key + '=' + encodeURIComponent(obj[key]) );
    }
    return arr.join('&');
}
function sizeBetter(size){
    if(size > 1024 * 1024 * 1024){
        return (size/1024/1024/1024).toFixed(2) + 'G';
    }else if(size > 1024 * 1024){
        return (size/1024/1024).toFixed(2) + 'M';
    }else{
        return (size/1024).toFixed(2) + 'K';
    }
}
function showTable(arr){
    var table = new Table({
        head : [ "标题", "magnet", "size" ]
    });
    arr.forEach(function(item){
        table.push([
            item.title, 'magnet:?xt=urn:btih:' + item.torrent_hash, sizeBetter( item.torrent_size ) 
        ]);
    });
    console.log( table.toString() );
}
function showCliff(arr){
    var rows = [
        ["hash", "size", "标题"]
    ];
    arr.forEach(function(item){
        rows.push([
            item.torrent_hash, sizeBetter( item.torrent_size ), item.title
        ]);
    });
    console.log(cliff.stringifyRows(rows, ['red', 'blue', 'green']));
}
exports.torrent = torrent;
