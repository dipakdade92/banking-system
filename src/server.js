const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/database');

// Connect to database
connectDB();

// Start server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});