import BookingService from "~/services/BookingService";

const getById = async (req, res) => {
    const id = req.params.id;
    try {
        const response = await BookingService.getById(id);
        if (response) return res.status(200).json(response);
    } catch (err) {
        return res.status(404).json(err);
    }
}

const getAll = async (req, res) => {
    try {
        const { userId = "", filter = "{}", finding = "", sort, page , limit } = req.query;
        // console.log("filter: ", filter);
        const response = await BookingService.getAll(userId, filter, finding,sort,page,limit);
        if (response) return res.status(200).json(response);
    } catch (err) {
        return res.status(404).json(err);
    }
}

const createNew = async (req, res) => {
    const data = req.body;
    try {
        const response = await BookingService.createNew(data);
        if (response) return res.status(200).json(response);
    } catch (err) {
        return res.status(404).json(err);
    }
}

const update = async (req, res) => {
  
    try {
        const data = req.body;
        const id = req.params.id;
        console.log("booking id: ", id),
        console.log("booking data: ", data);
        const response = await BookingService.update(id,data);
        if (response) return res.status(200).json(response); 
    } catch(err) {
        return res.status(404).json(err);
    }
}

export default {
    createNew,
    getAll,
    getById,
    update
}