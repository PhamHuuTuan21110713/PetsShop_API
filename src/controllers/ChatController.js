import ChatService from "~/services/ChatService";

const createChat = async (req, res) => {
    try {
        const {firstId, secondId} = req.body;
        const response = await ChatService.createChat(firstId,secondId);
        return res.status(201).json(response);
    }catch(err) {
        return res.status(500).json(err); 
    }
}

const findUserChats = async (req, res) => {
    try {
        const userId = req.params.userId;
        const response = await ChatService.findUserChats(userId);
        return res.status(200).json(response);
    }catch(err) {
        console.log(err);
        return res.status(500).json(err); 
    }
}

const findChat = async (req, res) => {
    try {
        const {firstId,secondId} = req.params;
        const response = await ChatService.findChat(firstId, secondId);
        return res.status(200).json(response);
    }catch(err) {
        return res.status(500).json(err); 
    }
}

export {
    createChat,
    findUserChats,
    findChat
}