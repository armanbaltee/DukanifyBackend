const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Required all fields");
  }
  next();
};

module.exports = {
  login
};
