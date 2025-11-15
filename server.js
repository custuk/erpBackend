const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config({ path: "./config.env" });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS middleware (Fixed)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "https://custuk.com/",
  "https://erp.data-orchestra.co.uk",
  "https://erpapi.data-orchestra.co.uk"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Handle OPTIONS preflight for all routes
app.options("*", cors());

// CORS middleware
// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "production"
//         ? false
//         : [
//           "http://localhost:3000",
//           "http://localhost:3001",
//           "http://localhost:3002",
//           "http://127.0.0.1:3000",
//           "http://127.0.0.1:3001",
//           "http://127.0.0.1:3002",
//           "https://erpapi.data-orchestra.co.uk/"
//         ],
//     credentials: true,
//   })
// );

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({
  limit: "10mb",
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('❌ JSON Parse Error:', e.message);
      console.error('❌ Raw body:', buf.toString());
      res.status(400).json({
        success: false,
        message: 'Invalid JSON format',
        error: e.message
      });
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cache control middleware for API routes
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI_DEV;
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ERP Backend API",
    status: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/users", require("./routes/users"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/material-requests", require("./routes/materialRequests"));
app.use("/api/child-requests", require("./routes/childRequests"));
app.use("/api/supply-chain-routes", require("./routes/supplyChainRoutes"));
app.use("/api/task-templates", require("./routes/taskTemplates"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/data-objects", require("./routes/dataObjects"));
app.use("/api/forms", require("./routes/forms"));
app.use("/api/business-rules", require("./routes/businessRules"));
app.use("/api/module-configurations", require("./routes/moduleConfigurations"));
app.use(
  "/api/customer-master-requests",
  require("./routes/customerMasterRequests")
);
app.use(
  "/api/vendor-master-requests",
  require("./routes/vendorMasterRequests")
);
app.use("/api/gl-account-requests", require("./routes/glAccountRequests"));
app.use("/api/data-requests", require("./routes/dataRequests"));

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
