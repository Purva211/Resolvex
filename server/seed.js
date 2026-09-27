require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

(async()=>{
  await connectDB();
  const password = await bcrypt.hash('123456',10);
  const users = [
    {name:'System Admin',email:'admin@resolvex.com',password,role:'admin'},
    {name:'Rahul',email:'rahul@resolvex.com',password,role:'agent'},
    {name:'Priya',email:'priya@resolvex.com',password,role:'agent'},
    {name:'Amit',email:'amit@resolvex.com',password,role:'agent'},
    {name:'Demo Customer',email:'customer@resolvex.com',password,role:'customer'}
  ];
  for (const u of users) await User.findOneAndUpdate({email:u.email},u,{upsert:true,new:true});
  console.log('Seed complete. Password for demo users: 123456');
  await mongoose.disconnect();
})();
