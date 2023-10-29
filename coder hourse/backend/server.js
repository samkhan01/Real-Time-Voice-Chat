require('dotenv').config();
const helmet = require('helmet');
const router = require('./routes');
const DbConnect = require('./database')
const express = require('express')
const app = express();

const cors = require('cors');

const corsOption = {
    origin: ['http://localhost:3000'],

}
app.use(cors(corsOption));

const PORT = process.env.PORT || 5500;
DbConnect();
app.use(express.json())
app.use(router);

app.get('/', (req, res) => {
    res.send("Hello from express js")
})
app.listen(PORT, () => {
    console.log('listen server on' + PORT);
})