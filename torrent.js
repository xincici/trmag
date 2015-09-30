var req = require('request');
var console = require('console');
var log4js = require('log4js'),
    logger = log4js.getLogger('trmag');
var cliff = require("cliff");

function torrent( program ){
    //tryBrisk( program );
    //tryTorrentProject( program );
    tryYtsto( program );
}

function tryTorrentProject( program ){
    var url = "http://torrentproject.se/";
    var data = {
        out : 'json',
        s : program.name || '' 
    };
    var fullUrl = url + '?' + serilize(data);
    logger.info( 'searching from torrentproject.se...' );
    req.get(fullUrl, function(err, res, body){
        if( err ){
            logger.error('errors happen, maybe the network is invalid!\n');
            tryBrisk( program );
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
        showCliffTorrentProject( arr );
    });
}

function tryBrisk( program ){
    var url = 'http://brisk.eu.org/api/magnet.php';
    var data = {
        q : program.name || ''
    };
    var fullUrl = url + '?' + serilize(data);
    logger.info( 'searching from brisk.eu.org...' );
    var options = {
        url: fullUrl,
        headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36',
        'Referer': 'http://brisk.eu.org/'
        }
    };
    req.get(options, function(err, res, body){
        if( err ){
            logger.error('errors happen again, maybe the network is invalid!\n');
            return;
        }
        var ret = JSON.parse(body);
        logger.info('种子总数：' + ret.length);
        var i = 0;
        var arr = ret.slice(0, program.size || 10);
        showCliffBrisk( arr );
    });
}
function tryYtsto(program){
    var url = 'https://yts.to/api/v2/list_movies.json';
    var data = {
        query_term : program.name || ''
    };
    var fullUrl = url + '?' + serilize(data);
    logger.info( 'searching from yts.to...' );
    var options = {
        url: fullUrl,
        headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36',
        'Referer': 'http://brisk.eu.org/'
        }
    };
    req.get(options, function(err, res, body){
        if( err ){
            logger.error('errors happen, maybe the network is invalid!\n');
            return;
        }
        var ret = JSON.parse(body);
        if(ret.status === 'ok' && ret.data && ret.data.movies){
            showCliffYtsto(ret.data.movies);
        }
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
function showCliffTorrentProject(arr){
    var rows = [ [ "magnet", "size", "标题" ] ];
    arr.forEach(function(item){
        rows.push([
            'magnet:?xt=urn:btih:' + item.torrent_hash, sizeBetter( item.torrent_size ), item.title
        ]);
    });
    console.log(cliff.stringifyRows(rows, ['red', 'blue', 'green']));
}
function showCliffBrisk(arr){
    var rows = [ ["magnet", "size", "标题"] ];
    arr.forEach(function(item){
        rows.push([
             item.magnet.split('&')[0], item.size, item.title
        ]);
    });
    console.log(cliff.stringifyRows(rows, ['red', 'blue', 'green']));
}
function showCliffYtsto(arr){
    var rows = [ ["标题", "magnet", "size"] ];
    arr.forEach(function(item){
        rows.push([
             item.title_long || item.title, ' ', ' '
        ]);
        var torrents = item.torrents;
        torrents.forEach(function(tmp){
            rows.push([
                ' ', 'magnet:?xt=urn:btih:' + tmp.hash, tmp.size
            ]);
        });
    });
    console.log(cliff.stringifyRows(rows, ['red', 'blue', 'green']));
}

module.exports = torrent;
