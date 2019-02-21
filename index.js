'use strict';

const
    bodyParser = require('body-parser'),
    config = require('config'),
    express = require('express'),
    request = require('request');

var app = express();
var port = process.env.PORT || process.env.port || 5000;
app.set('port',port);
app.use(bodyParser.json());
app.use(express.static('public'));

const SHEETDB_PRODUCTINFO_ID =config.get('productinfo_id');

app.post('/webhook',function(req, res){
    console.log("[WebHook] In");
    let data = req.body;
    let queryCategory = data.queryResult.parameters["Category"];
    console.log("[queryCategory] "+queryCategory);
    var thisQs = {};
    if(queryCategory == "熱門"){
        thisQs.IsHot = "TRUE";
    }else{
        thisQs.Category =queryCategory;
    }
    thisQs.casesensitive = false;
    
    request({
        uri:"https://sheetdb.io/api/v1/"+SHEETDB_PRODUCTINFO_ID+"/search?",
        json:true,
        method:"GET",
        headers:{"Content-Type":"application/json"},
        qs:thisQs
    },function(error, response, body){

        if(!error && response.statusCode ==200){
            console.log("[SheetDB API] Success");
            sendCards(body, res);
        }else{
            console.log("[SheetDB API] failed");
        }
    });        
});

app.listen(app.get('port'),function(){
    console.log('[app.listen] Node app is running on port', app.get('port'));
});

module.exports = app;

function sendCards(body, res){
    
    console.log("[send] In");
    var thisFulfillmentMessages = [];
            for (var i=0;i<body.length;i++){
                    
                var thisObject={};
                    thisObject.card={};
                    thisObject.card.title=body[i].Name;
                    thisObject.card.subtitle=body[i].Category;
                    thisObject.card.imageUri=body[i].Photo;
                    thisObject.card.buttons=[{
                        "text":"看大圖",
                        "postback":body[i].Photo
                    }];
                    thisFulfillmentMessages.push(thisObject);
                }
                    var responseObject = {fulfillmentMessages:thisFulfillmentMessages};
                res.json(responseObject);
            };
