const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  await connectDB();
  const adminEmail = 'bharathadmin@gmail.com';
  
  const exists = await User.findOne({ email: adminEmail });
  if (exists) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const password = await bcrypt.hash('Bharath005@', 12);
  await User.create({
    fullName: 'Fresh Mart Admin',
    email: adminEmail,
    phone: '9999999999',
    address: 'Head Office',
    password,
    role: 'admin',
  });

  console.log('Admin user created:', adminEmail);
  process.exit(0);
};

createAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
