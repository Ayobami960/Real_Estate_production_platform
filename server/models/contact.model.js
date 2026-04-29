import mongoose from "mongoose";


const contactSchema = new mongoose.Schema({

     name: {
        type: String,
        required: true
    },

     email: {
        type: String,
        required: true
    },

     phone: {
        type: Number,
    },

    role: {
        type: String,
        emum: ["buyer", "seller"],
        required: true
    },
    message: {
        type: String,
        required: true
    }
  }, {
      timestamps: true
  })
  
  const Contact = mongoose.model("Contact", contactSchema);
  
  export default Contact;