module.exports = function validateContact(req, res, next) {
  const { firstName, lastName, phone, email, message } = req.body;

  if (!firstName | !lastName | !phone | !email | !message) {
    return res.status(400).json({ error: "All fields must be filled" });
  }
};
