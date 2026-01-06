require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { errorHandler } = require("./middlewares");
const router = require("./routes");

const PORT = process.env.PORT || 3000;
const app = express();

app.set("trust proxy", 1);

// ✅ PARSE MULTIPLE FRONTEND URLS (THIS IS THE KEY)
const allowedOrigins = process.env.FRONTEND_URL
  .split(",")
  .map(url => url.trim());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ MULTI-ORIGIN CORS (WORKS)
app.use(cors({
  origin: (origin, callback) => {
    // Allow Postman / server-to-server
    if (!origin) return callback(null, true);

    // Allow multiple frontends + local dev
    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/", router);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Allowed origins:", allowedOrigins);
  console.log(`Server running on port ${PORT}`);
});
