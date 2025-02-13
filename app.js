const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./src/db/db');
const router = require('./src/routes/router');
require('dotenv').config();


const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(express.json());

// app.use(cookieParser());


connectDB();

app.use(router);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
