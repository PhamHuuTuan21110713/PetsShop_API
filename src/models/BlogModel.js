import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    contents: [
        { 
            titleContent: { type: String, required: true, trim: true },
            contentItem: [{ type: String }]
        }],
        
    img: { type: String, required: true, trim: true },
    imgPath: { type: String, required: false, trim: true },
    state: { type: Boolean, required: false, default: true }
}, {
    timestamps: true,
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;