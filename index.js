const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Set up session for customer routes
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization']; // Extract token from headers

    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }

    jwt.verify(token, "fingerprint_customer", (err, decoded) => {
        if (err) {
            return res.status(401).send("Invalid token.");
        }
        req.user = decoded; // Store decoded token in request for later use
        next(); // Allow the request to proceed
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port", PORT));