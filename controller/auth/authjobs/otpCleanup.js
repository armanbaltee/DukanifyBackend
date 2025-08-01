// // jobs/otpCleanup.js
// const cron = require('node-cron');
// const User = require('../../../models/auth/user.model');

// cron.schedule('*/1 * * * *', async () => {
//   try {
//     const now = new Date();
//     const result = await User.updateMany(
//       { otpExpires: { $lt: now } },
//       { $unset: { otp: "", otpExpires: "" } }
//     );
//     console.log(`[OTP Cleanup] Cleared ${result.modifiedCount} expired OTPs`);
//   } catch (err) {
//     console.error('OTP Cleanup Error:', err.message);
//   }
// });