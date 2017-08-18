// NPM modules
var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rpn = require('request-promise');
var fs = require("fs-extra");
var _filter = require('lodash').filter;

// Local modules
var youtubeFetcher=require("sc-youtube")
var crawler = require("./crawler.js");

// Settings
// TODO: this is more accidental than clever; the whole config subject 
var configPath = "./config/local.json"
//Some conviniend infos
var configDefault = crawler.getConfigDefault();
var config, configMessage = "",
    configOK = true;
fs.ensureFileSync(configPath)
try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"))
} catch (err) {
    configMessage = "Local config not valid! Writing a default config to " + configPath + ". Please use it accordingly.";
    config = configDefault
    fs.writeFileSync("./config/local.json", JSON.stringify(config), {
        encoding: "utf8"
    })
    configOK = false;
}
configOK &= crawler.configValid(config)

//Express sub app definition
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



// TODO make the following more elegnat using app with error
if (configOK) {
    app.get('/', function (req, res, next) {
        httpAgent = new http.Agent();
        httpAgent.maxSockets = 50;
        // Fetch video list of channels defined in config file
        crawler.crawl(config, youtubeFetcher, function (videoMetaItems) {
            var requestPromises = videoMetaItems.map(function (videoMetaItem) {
                return rpn({
                    method: 'POST',
                    uri: config.endpointuri,
                    json: videoMetaItem,
                    resolveWithFullResponse: true,
                    auth: {
                        user: process.env.CONTENT_USER,
                        pass: process.env.CONTENT_PASSWORD
                    },
                    pool: httpAgent,
                    timeout: 1500,
                    time: true
                }).catch();
            });
            var toResultObject = function (promise) {
                return promise
                    .then(request => ({
                        success: true,
                        request
                    }))
                    .catch(request => ({
                        success: false,
                        request
                    }));
            };
            Promise.all(requestPromises.map(toResultObject)).then(function (resultObjects) {
                var successful = _filter(resultObjects, {
                    success: true
                });
                var failed = _filter(resultObjects, {
                    success: false
                });
                res.send({
                    successful: {
                        count: successful.length,
                    },
                    failed: {
                        count: failed.length,
                    }
                });
            });
        });

    });
} else {
    app.get('/', function (req, res) {
        res.send("Message: " + configMessage);
    })
}
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;