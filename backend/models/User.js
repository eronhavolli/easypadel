const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {type: String,required: true,unique: true,lowercase: true,trim: true,},
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true }, 
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

//const mongoose = require('mongoose');

//const userSchema = new mongoose.Schema({
//  username: { type: String, required: true, trim: true },
//  password: { type: String, required: true }, // en clair car la BDD l'est aussi
//  role:     { type: String, default: 'user' }
//}, { timestamps: true, collection: 'users' }); 

//module.exports = mongoose.model('User', userSchema);
