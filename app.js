const path = require('path');
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');

const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');

dotenv.config({ path: 'config.env' });
const dbConnection = require('./config/database');

// Routes
const mountRoutes = require('./routes');
const { webhookCheckout } = require('./services/orderService');

// Connect with DB
dbConnection();

// express app
const app = express();

// Enable other domines to access your application
app.use(cors());
app.options('*', cors()); // include before other routes

// compress all responses
app.use(compression());

// Checkout webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);

// Middlewares
app.use(express.json());

app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routers
mountRoutes(app);

app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const port = process.env.PORT || 8080;

console.log(port);

const server = app.listen(port, () => {
  console.log(`App Running on port ${port}`);
});

// Handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log('Shutting down...');
    process.exit(1);
  });
});
