import ShopInformationService from "~/services/ShopInformationService";

const getInformationById = async (req, res) => {
    const id = req.params.id
    try {
        const response = await ShopInformationService.getInformationById(id);
        return res.status(200).json(response);
    }catch(err) {
        return res.status(404).json(err);
    }
}

const createInformation= async (req, res) => {
    const data = req.body;
    try {
        const response = await ShopInformationService.createInformation(data);
        return res.status(201).json(response);
    }catch(err) {
        return res.status(404).json(err);
    }
}

export default {
    createInformation,
    getInformationById
}