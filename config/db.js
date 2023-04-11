const mongoose = require("mongoose");
// const config = require("config");
// const db = config.get("mongoURI");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			// useCreateIndex: true,
			// useFindAndModify: false,
			useUnifiedTopology: true,
		});

		console.log("MongoDb Connected..");
	} catch (err) {
		console.log(err.message);
		process.exit(1);
	}
};

module.exports = connectDB;
