var express = require('express');
var router = express.Router();
const request = require('superagent');
// var ifsData = require('../utils/dataUtil1.js')
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
// var mongoose = require('mongoose');
const assert = require('assert')

var url = 'mongodb+srv://jacobs:Jacobs123@cluster0-rjppa.azure.mongodb.net/test?retryWrites=true&w=majority'

router.get('/', function(req, response, next) {
    // var payload = GetCMSPayload(req.query.type, response);    
    // QueryMongoDB (response)

    getMongoClient (response, req.query.keyword);
    // MongooseCallback(response)
    // console.log("data api contacted")
});

function getMongoClient(response, keyword){
    const dbName = "tyndall1"
    const client = new MongoClient(url, {useNewUrlParser: true});

    client.connect (function (err){
        // assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db("tyndall1");
        // insertDocuments
        //console.log(db)
        // insertDocuments(db, console.log)
        FindKeyword(db, response, keyword)
        client.close();
    })
}
function FindKeyword (db, response, keyword){
    //https://stackoverflow.com/questions/15136016/how-can-i-sort-by-elemmatch-in-mongodb
    // {keywords: {$all: [ {text: "permanent global positioning system"} ] }}
    var re = new RegExp(keyword,"i")
    var re2 = new RegExp(keyword+"\\s","i")
    console.log(re)
    const collection = db.collection("entries");
    

    // ,
    //     {$match: {text: re}},
    //     {$sort: {"keywords.relevance":-1}}
    // ])


    // db.collection('entries').aggregate([
    //     {$unwind: "$keywords"},
    //     // {$match: {"keywords.text": re}},
    //     {$match: {$or: [{"keywords.text": re},{"keywords.text": re2}]}},
    //     {$sort: {"keywords.relevance": -1} }
    // ]).toArray(function (err, result){
    //     result = [...new Set(result)];
    //     var payload = JSON.stringify(result)
    //     // console.log(payload)
    //     response.send(payload)
    // })

    docArr = []
    docSet = {}

    db.collection('entries').aggregate([
        {$unwind: "$keywords"},
        // {$match: {"keywords.text": re}},
        {$match: {$or: [{"keywords.text": re},{"keywords.text": re2}]}}/*,
        {$sort: {"keywords.relevance": -1} }*/
    ]).forEach(function (doc){
        // console.log(doc)
        // console.log(docSet.hasOwnProperty(doc._id))
        if (!(docSet.hasOwnProperty(doc._id))){
            docSet[doc._id] = doc._id;
            docArr.push({_id: doc._id, keyword: doc.keywords.text, relevance: doc.keywords.relevance})
        }
    }, function (){
        // console.log(docArr)
        //query with docset id and pass in keyword and relevance as variables
        docArrMap1 = docArr.map(function(item){
            return {
                _id: new ObjectID(item['_id'])/*, 
                toString: function(){
                    return "_id: "+this._id;
                }*/
            };
        })/*.toString()*/;
        // console.log(docArrMap1)
        // var o_id = new ObjectID('5db224f3c4cc5d17f2922251');
        _query = {'$or': docArrMap1};
        // console.log(_query)

        const client2 = new MongoClient(url, {useNewUrlParser: true});
        client2.connect (function (err){
            const db2 = client2.db("tyndall1");
            db2.collection('entries').find(_query).toArray(function(err, result){
                console.log(docArr.length)
                result2 = result.map(function(item){
                    for(var i=0; i<docArr.length; i++){
                        console.log(item._id.toString().trim() +" | "+ docArr[i]._id)
                        if(item["_id"].toString().trim() == docArr[i]._id.toString().trim()){
                            console.log("match")
                            item.relevance = docArr[i].relevance;
                            item.keyword = docArr[i].keyword;
                            return item
                        }
                    }
                })
                result = result.sort(function (a, b){
                    return b.relevance - a.relevance;
                })
                var payload = JSON.stringify(result);
                response.send(payload);
                
            })
            client2.close();
        })
    })

    //returns working data
    // toArray(function (err, result){
    //     result = [...new Set(result)];
    //     var payload = JSON.stringify(result)
    //     // console.log(payload)
    //     response.send(payload)
    // })


    // console.log(ag)
    // console.log(db.collection('entries'))
    // collection.find( {keywords: {$elemMatch: {text: re}} } ).toArray(function (err, result){
    //     var payload = JSON.stringify(result)
    //     // console.log(payload)
    //     // response.send(payload)
    // })
    
}
function insertDocuments (db, callback){
    const collection = db.collection("entries");
    collection.insertMany([
        {_idx: 20, name: "hamburger"},
        {_idx: 40, name: "taco"}
    ], function (err, result){
        // assert.equal(err, null);
        callback(result)
    })
}

function QueryMongoDB (response){
    MongoClient.connect('mongodb+srv://jacobs:Jacobs123@cluster0-rjppa.azure.mongodb.net/test?retryWrites=true&w=majority', (err, database) => {
        //start the server
        // mongodb+srv://jacobs:Jacobs123@cluster0-rjppa.azure.mongodb.net/test?retryWrites=true&w=majority
        // response.send(database)
        console.log(database.db("tyndall1").entries)
        // var collect1 = database.db("cluster0").collect1;
        // collect1.insert_one({
        //     "_id": 1,
        //     "name": "pizza",
        //     "year": "2019"
        // })
        
    })
}



// function MongooseCallback (response){
//     var mongoose.connect('mongodb+srv://jacobs:Jacobs123@cluster0-rjppa.azure.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

// }

module.exports = router;