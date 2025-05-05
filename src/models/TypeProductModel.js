import mongoose from "mongoose";

const typeProductSchema = new mongoose.Schema({
    name: {type: String, require: true, trim: true}
})

const Type = mongoose.model('Type', typeProductSchema);

export default Type;