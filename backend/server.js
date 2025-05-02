const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const restaurantRoutes = require('./routes/restaurants');
const { router: authRoutes } = require('./routes/auth');
const adminRoutes = require('./routes/admin');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
