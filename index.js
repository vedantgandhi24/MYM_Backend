const express = require("express");
const connectDB = require("./config/db");
var cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(cors());

//Connect Database
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));

//Define routes
app.use("/api/users", require("./routes/users"));

app.get("/test", (req, res) => {
	res.send("WELCOME!!!");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
