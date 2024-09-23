const log = require("./middlewares/log.js");
log.info("Starting Server"); // log startup, override console.log


// *App Packages
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv"); // for use of environment variables
const http = require("http");
const config = dotenv.config(); // Prints Local Variables
console.debug("Env Vars: " + JSON.stringify(config));


// *Import Middlewares
const errorHandler = require("./middlewares/error.js"); // error handling


// *App Setup
const app = express();
app.use(cors());
app.use(express.json());


/**
 *
 * Routes:
 * - GET /health
 *   - returns "Server Running"
 * - GET /ready
 *   - returns "Server Ready"
 * - GET/error
 *   - returns "Server Error"
 */
app.use("/health", require("./routes/get/healthCheck.js"));
app.use("/ready", require("./routes/get/readyCheck.js"));
app.use("/error", require("./routes/get/errorTest.js"));


const rabbit = require("./utils/rabbit.js");
const dbController = require("./utils/db.js");

rabbit.initialize();
dbController.connect();




// START SERVER

// init


const httpServer = http.createServer(app); // create a server object
const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
});


app.use(errorHandler);

