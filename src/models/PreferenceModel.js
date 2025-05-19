
import mongoose from "mongoose";
const PreferenceSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    prefres: {
        type: [
            {
                productId: { type: String },
                accessDate: { type: Date }
            }
        ],
        default: []
    },
    views: {
        type: [
            {
                productId: { type: String },
                accessDate: { type: Date },
                numberAccess: { type: Number }
            }
        ],
        default: []
    }

});

const Preference = mongoose.model("Preference", PreferenceSchema);

export default Preference;
