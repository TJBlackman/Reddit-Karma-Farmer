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

const setIndex = function(num){
    db.set('index', num).write(); 
}

// retrieve index
const getIndex = function(){
    return db.get('index').value() || 0;
};

// record an error
const recordError = function(err, imgPath){
    db.get('errors')
        .push({
            time: new Date().toLocaleString(),
            message: err.message,
            fileName: err.fileName,
            line: err.lineNumber,
            imagePath: imgPath
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
    incrementIndex,
    getIndex,
    recordError,
    recordArticle,
    setIndex
}