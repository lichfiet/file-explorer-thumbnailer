const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).send("Server Running");
    } catch (error) {
        next(error);  // Pass errors to the Express error handler
    }
});

module.exports = router;