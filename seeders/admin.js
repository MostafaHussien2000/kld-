const mongoose = require('mongoose');

const User = require('../models/userModel');

const adminSeeder = async () => {
  await mongoose.connect(
    'mongodb+srv://admin:admin@cluster0.0apjt.mongodb.net/',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  const existingAdmin = await User.findOne({ role: 'admin' });

  if (!existingAdmin) {
    const adminCredentials = {
      name: 'Admin',
      email: 'admin@kld.com',
      password: 'password123',
      role: 'admin',
    };
    await User.create(adminCredentials);

    console.log('Admin created successfully.');
  } else {
    console.log('Admin already exists.');
  }

  await mongoose.disconnect();
};

adminSeeder()
  .then(() => {
    console.log('Admin seeder completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Admin seeder error:', err);
    process.exit(1);
  });
