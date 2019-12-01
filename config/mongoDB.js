const MongoClient = require('mongodb').MongoClient;

/* Connection URL const url = 'mongodb://localhost:27017'; for local */
// const uri = "mongodb+srv://raul:BSDErtaMytRcjoUc@levelup-mdfug.mongodb.net/admin?retryWrites=true&w=majority";
const uri = process.env.MONGODB_URI;
// Database Name
// const dbName = 'LEVELUP';
const dbName = process.env.MONGODB_NAME;
// Use connect method to connect to the server
MongoClient.connect(
    uri, {
        useNewUrlParser: true
    },
    function (err, db) {
        if (err) throw err;
        global.dbo = db.db(dbName);
       
    }
);

