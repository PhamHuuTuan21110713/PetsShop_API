import * as NotificationService from "~/services/NotifitcationService";

const createNotification = async (req, res) => {
    try {
        const data = req.body;
        // console.log("notifi data: ", data);
        const response = await NotificationService.createNotification(data);
        res.status(201).json(response);
    } catch (err) {
        res.status(500).json(err);
    }

}

const updateNotification = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const response = await NotificationService.updateNotification(id, data);
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json(err);
    }

}

const findNotification = async (req, res) => {

    try {
        const data = req.query;
        
        let state = true
        if(data.state !== null && data.state !== undefined) {
            state = data.state
        }
        const response = await NotificationService.findNotification(data,state);
        res.status(200).json(response);
    } catch (err) {
        console.log("notify err", err);
        res.status(500).json(err);
    }

}

const findNotificationById = async (req, res) => {

    try {
        const id = req.params.id;
        console.log("notify id: ", id);
        const response = await NotificationService.findNotificationById(id);
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json(err);
    }

}

const deleteNotification = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await NotificationService.deleteNotification(id);
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateMany = async (req, res) => {

    try {
        const { senderId, receiverId, type, data } = req.body;
        if(!senderId || !receiverId || !type || !data ) return res.status(500).json({status: "ERR", message: "Yêu cầu đầy đủ thông tin"});
        const response = await NotificationService.updateMany(senderId, receiverId, type, data);
        res.status(200).json(response);
    } catch (err) {
        console.log("err xoa mess: ", err);
        res.status(500).json(err);
    }

}

export {
    createNotification,
    updateNotification,
    findNotification,
    deleteNotification,
    findNotificationById,
    updateMany
};