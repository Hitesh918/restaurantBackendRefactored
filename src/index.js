const express = require('express');
const bodyParser = require('body-parser');

const { PORT, NODE_ENV } = require('./config/server.config');
const apiRouter = require('./routes');
const errorHandler = require('./utils/errorHandler');
const connectToDB = require('./config/db.config');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || (NODE_ENV === 'production' ? false : true),
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.text());

// Serve static files from uploads directory
const path = require('path');
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

app.use('/api', apiRouter);


app.get('/ping', (req, res) => {
    return res.json({message: 'Restaurant Service is alive'});
});

app.use(errorHandler);

// Start server
(async () => {
    try {
        await connectToDB();
        app.listen(PORT, () => {
            console.log(`Server started at PORT: ${PORT}`);
            console.log(`Environment: ${NODE_ENV}`);
            console.log(`API Base URL: http://localhost:${PORT}/api/v1`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
})();
