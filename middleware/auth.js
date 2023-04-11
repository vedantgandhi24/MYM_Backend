const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../routes/models/User");

//Check if user is logged in
exports.auth = async (req, res, next) => {
	// Get token from header
	const token = req.header("x-auth-token");
	// const token = req.header("authorization");
	console.log("TOKEN", token);
	//Check if token exists
	if (!token) {
		return res.status(401).json({ msg: "No token, authorization denied" });
	}

	try {
		const decoded = jwt.verify(token, config.get("jwtSecret"));
		console.log("DECODEd", decoded);
		console.log("DECODE USERID", decoded.user.email);

		req.user = await User.findOne({ email: decoded.user.email });
		console.log("USER______", req.user);

		next();
	} catch (err) {
		res.status(401).json({ msg: "Token is not valid" });
	}
};
