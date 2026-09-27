require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();

connectDB().catch(err => { console.error(err); process.exit(1); });
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/', (req,res)=>res.json({ message:'ResolveX API is running' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notifications', require('./routes/notifications'));
app.use((err,req,res,next)=>res.status(500).json({message:err.message || 'Server error'}));
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`));
require('./services/slaMonitor').startSlaMonitor();
