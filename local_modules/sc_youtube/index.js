var request = require('request-promise');

// Module vars
var _config = {
    "apikey": "<apikey>",
    "channels": []
}
var _fetchAsync = false;
var _returnItems = [];
var _callbackFunc = function (_returnItems) {
    console.log(_returnItems)
    console.log("length of all fetched videos:", _returnItems.length)
}

// Module private methods
/**
 * Fetching information objects for one Youtube channel id. See Youtube API: https://developers.google.com/youtube/v3/docs/channels/list
 * @param {string} channelId - The Youtube channel id as string.
 * @param {string} nextPageToken - Utility flag indicating a further page of results.
 */
function _fetchChannelVideos(channelId, nextPageToken) {
    var options = {
        method: "GET",
        uri: "https://www.googleapis.com/youtube/v3/search",
        qs: {
            part: "snippet",
            channelId: channelId,
            maxResults: 50,
            key: _config.apikey,
            order: "date"
        }
    }
    if (nextPageToken !== undefined) {
        options.qs.pageToken = nextPageToken
    }
    request(options)
        .then(function (response) {
            response = JSON.parse(response)
            var chunkedItems = [];
            response.items.map(function (item) {
                if (item.id.videoId !== undefined) {
                    chunkedItems.push(item.id.videoId);
                }
            })
            //result page no. 1 to n-1       
            if (response.hasOwnProperty("nextPageToken")) {
                _fetchVideoList(chunkedItems, false)
                _fetchChannelVideos(channelId, response.nextPageToken)
            } else {
                //result page n
                console.log("last chunk of channel videos fetched")
                _fetchVideoList(chunkedItems, true)
            }
        })
        .catch(function (err) {
            // Something bad happened, handle the error
            console.log(err)
        })
}


/**
 * Fetching information objects from a list of Youtube video ids. See Youtube API: https://developers.google.com/youtube/v3/docs/videos/list
 * @param {Object[]} videoList - The list of video ids; each as string. List length must be <51.
 * @param {*} isLastChunk - Utility flag, set to true in case the last chunk is reached. 
 */
function _fetchVideoList(videoList, isLastChunk) {
    if (videoList.length > 0) {
        var options = {
            method: "GET",
            uri: "https://www.googleapis.com/youtube/v3/videos",
            qs: {
                part: "snippet,status",
                id: videoList.toString(),
                key: _config.apikey
            }
        }
        request(options)
            .then(function (response) {
                if (_fetchAsync) {
                    _returnItems = JSON.parse(response).items
                    _callbackFunc(_returnItems)
                } else {
                    _returnItems = _returnItems.concat(JSON.parse(response).items)
                    //CHECK FOR LAST CHUNK
                    if (isLastChunk === true) {
                        _callbackFunc(_returnItems)
                    }
                }

            })
            .catch(function (err) {
                // Something bad happened, handle the error
                console.error(err)
            })
    } else {
        console.log("writing chunklist")
    }
}
/**
 * 
 * @param {object} config 
 */
function _configValid(config) {
    var returnValue = true;
    returnValue &= config !== undefined;
    returnValue &= config.hasOwnProperty("apikey") ? config.apikey !== "" && config.apikey.indexOf("<apikey>") : false;
    returnValue &= config.hasOwnProperty("channels") ? config.channels.length != 0 : false;
    return returnValue;
}
// Module public methods
/**
 * 
 * @param {object} config - Simple config object containing the API key and an array of channel ids as strings. 
 * @param {function} callbackFunc - The callback that handles the response.callbackFunc 
 * @param {boolean} fetchAsync - Utitlity flag setting whether the callback is called with every chunk or with the complete list of fecthed videos.
 */
function fetch(config, callbackFunc, fetchAsync) {
    if (_configValid(config)) {
        _fetchAsync = (fetchAsync === undefined) ? _fetchAsync : fetchAsync;
        _returnItems = [];
        _callbackFunc = callbackFunc || _callbackFunc
        _config = config;
        _config.channels.map(function (item) {
            _fetchChannelVideos(item)
        })
    } else {
        console.log("youtube channel config not valid!")
        console.log("editable youtube channel config blueprint:", JSON.stringify(_config))
    }
}

function fetchVideoList(videoList) {

}
module.exports = {
    fetch: fetch,
    fetchVideoList: fetchVideoList
}