import BookingService from "~/services/BookingService";

const getById = async (req,res) => {
    const id = req.params.id;
    try {
        const response = await BookingService.getById(id);
        if(response) return res.status(200).json(response);
    }catch(err) {
        return res.status(404).json(err);
    }
}

const getAll = async (req, res) => {
    try {
        const response = await BookingService.getAll();
        if(response) return res.status(200).json(response);
    }catch(err) {
        return res.status(404).json(err);
    }
}

const createNew = async (req, res) => {
    const data = req.body;
    try {
        const response = await BookingService.createNew(data);
        if(response) return res.status(200).json(response);
    }catch(err) {
        return res.status(404).json(err);
    }
}

export default {
    createNew,
    getAll,
    getById
}