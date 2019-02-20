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

const MOVIE_APP_ID =config.get('movie_app_id');

app.post('/webhook',function(req, res){
    let data = req.body;
    let MovieName = data.queryResult.parameters.MovieName;
    let propertiesObject = {
        api_key:MOVIE_APP_ID,
        query:MovieName,
        language:"zh-TW"
    };
    request({
        uri:'https://api.themoviedb.org/3/search/movie?',
        json:true,
        qs:propertiesObject
    },function(error, response, body){
        if(!error && response.statusCode ==200){
            var thisFulfullmentMessages = [];
            
            for (var i=0;i<body.results.length;i++){

                    var thisText={};
                    thisText.text={};
                    thisText.text.text=[];
                    thisText.text.text.push(body.results[i].title);

                    var thisText2={};
                    thisText2.text={};
                    thisText2.text.text=[];
                    thisText2.text.text.push(body.results[i].overview);

                    var thisImage={};
                    thisImage.image={};
                    thisImage.image.imageUri='https://image.tmdb.org/t/p/w300_and_h450_bestv2'+ body.results[i].poster_path;

                    // var thisObject={};
                    // thisObject.card={};
                    // thisObject.card.title=body.results[i].title;
                    // thisObject.card.subtitle=body.results[i].overview;
                    // thisObject.card.imageUri='https://image.tmdb.org/t/p/w300_and_h450_bestv2'+ body.results[i].poster_path;
                    // thisObject.card.buttons=[{
                    //     "text":"上映時間:" + body.results[i].release_date + ' (點我看預告片) ',
                    //     "postback":'https://www.themoviedb.org/movie/' + body.results[i].id +'/videos?active_nav_item=Trailers&video_language=en-US'
                    // }];

                    thisFulfullmentMessages.push(thisText,thisText2,thisImage); //,thisObject
                    var responseObject = {fulfillmentMessages:thisFulfullmentMessages};
                };
                res.json(responseObject);
            }else{
        console.log("[theMovieDB] failed")
    }
});
});

app.listen(app.get('port'),function(){
    console.log('[app.listen] Node app is running on port', app.get('port'));
})

module.exports = app;