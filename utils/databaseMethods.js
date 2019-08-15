const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const categories = require('../assets/categories');
const path = require('path');
const adapter = new FileSync(path.join(__dirname, '../db.json'));
const db = low(adapter);

// increment index
const incrementIndex = function(){
    db.update('index', i => i === categories.length - 1 ? 0 : i+=1).write();
};

// retrieve index
const getIndex = function(){
    return db.get('index').value();
};

// record an error
const recordError = function(err){
    db.get('errors')
        .push({
            time: new Date().toLocaleString(),
            message: err.message,
            fileName: err.fileName,
            line: err.lineNumber
        })
        .write();
}

// record an article
const recordArticle = function(article, index, subreddit){
    var articles = db.get('articles').value(); 
    var date = new Date().toLocaleString();
    if (article){
        articles[index] = {
            ...article,
            timestamp: date,
            subreddit: subreddit
        }
    } else {
        articles[index] = `FAILED | ${date} | ${subreddit}`; 
    }
    db.set('articles', articles).write(); 
}



module.exports = {
    incrementIndex: incrementIndex,
    getIndex: getIndex,
    recordError: recordError,
    recordArticle: recordArticle
}