const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured. Add it to your .env file.');
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const publicUser = (user) => ({
  id: user._id.toString(), name: user.name, email: user.email, university: user.university,
  batchYear: user.batchYear, whatsappNumber: user.whatsappNumber, createdAt: user.createdAt
});

const register = async (req, res, next) => {
  try {
    const { name, email, password, university, batchYear, whatsappNumber } = req.body;
    if (!name || !email || !password || !university || batchYear === undefined || !whatsappNumber) {
      return res.status(400).json({ success: false, message: 'name, email, password, university, batchYear, and whatsappNumber are required' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    const user = await User.create({
      name: String(name).trim(), email: normalizedEmail, password: await bcrypt.hash(String(password), 12),
      university, batchYear: Number(batchYear), whatsappNumber: String(whatsappNumber).trim()
    });
    return res.status(201).json({ success: true, message: 'Registration successful', token: createToken(user._id.toString()), user: publicUser(user) });
  } catch (error) { return next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+password');
    const passwordMatches = user && await bcrypt.compare(String(password), user.password);
    if (!passwordMatches) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    return res.status(200).json({ success: true, message: 'Login successful', token: createToken(user._id.toString()), user: publicUser(user) });
  } catch (error) { return next(error); }
};

module.exports = { register, login };
