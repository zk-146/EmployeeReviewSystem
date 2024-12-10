require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const csrf = require("csurf");
const routes = require("./routes/index");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const cron = require("node-cron");
const { updateReviewCycleStatuses } = require("./utils/reviewCycleUtils");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
// app.use(csrf());
app.use(morgan("dev"));
app.use(errorHandler);

const csrfProtection = csrf({ cookie: true });

// app.use(csrfProtection);

// Routes
app.use("/api", routes);

// app.use((err, req, res, next) => {
//   if (err.code !== "EBADCSRFTOKEN") return next(err);
//   res.status(403).json({ message: "Invalid CSRF token" });
// });

cron.schedule("0 0 * * *", () => {
  updateReviewCycleStatuses();
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
