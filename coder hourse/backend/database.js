const mongoose = require('mongoose');

function connectToDatabase() {

    const DB_URL = process.env.DB_URL;

    mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error'));

    db.once('open', () => {
        console.log('db connnected............');
    })

}


module.exports = connectToDatabase;
