const User = require("../models/auth/user.model");
const cron = require("node-cron");

const deleteUser = async () => {
  try {
    const notVerifiedTeachers = await User.find({ isVerified: false });

    if (notVerifiedTeachers.length === 0) {
      console.log("All teachers are verified.");
      return;
    }

    const result = await User.deleteMany({ isVerified: false });
    console.log(`Deleted ${result.deletedCount} unverified users.`);
  } catch (error) {
    console.error("Error in deleting:", error.message);
  }
};


cron.schedule("*/5 * * * * *", deleteUser);
