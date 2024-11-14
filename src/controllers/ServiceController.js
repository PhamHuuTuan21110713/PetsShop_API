import ServiceService from "~/services/ServiceService";

const createService = async (req, res) => {
    const data = req.body;
    try {
        const response = await ServiceService.createService(data);
        if(response) {
            return res.status(201).json(response);
        }
    }catch(err) {
        return res.status(404).json(err);
    }
}

const getAllServices = async (req, res) => {
    try {
        const response = await ServiceService.getAllServices();
        if(response) {
            return res.status(200).json(response);
        }
    }catch(err) {
        return res.status(404).json(err);
    }
}

const getServiceById = async (req, res) => {
    const id = req.params.id;
    try {
        const response = await ServiceService.getServiceById(id);
        if(response) {
            return res.status(200).json(response);
        }
    }catch(err) {
        return res.status(404).json(err);
    }
}

export default {
    createService,
    getAllServices,
    getServiceById
}