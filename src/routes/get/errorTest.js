const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        throw new Error("This is a test error"); // intercepted by "errorHandler" middleware
    } catch (error) {
        next(error);
    }
});

module.exports = router;