import mongoose, { Schema } from "mongoose";

let UserSchema = new Schema({
  name: String,
  email: String,
  apiKey: String,
  stocks: [
    { 
      stock: String, 
      price: Number, 
      amount: Number, 
      date: Date, 
      kind: { type: String, required: false }, 
      symbol: { type: String, required: false } 
    }
  ],
  cash: {
    type: Number,
    required: true,
    default: 25000
  }
});

module.exports = mongoose.models.Users || mongoose.model("Users", UserSchema);