const express = require('express');
const cors = require('cors')
const profileRoutes = require('./routes/profile.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Register routes
app.use('/api', profileRoutes);

// Error handler must be last
app.use(errorHandler);  

module.exports = app;