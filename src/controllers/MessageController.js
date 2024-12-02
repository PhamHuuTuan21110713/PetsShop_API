import MessageService from "~/services/MessageService";
const createMessage = async (req, res) => {
    try {
        const { chatId, senderId, text } = req.body;
        const response = await MessageService.createMessage({
            chatId,
            senderId,
            text
        });
        return res.status(201).json(response);

    } catch (err) {
        return res.status(500).json(err);
    }
}
const getMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const response = await MessageService.getMessage(chatId);
        return res.status(200).json(response);

    } catch (err) {
        return res.status(500).json(err);
    }
}

export {
    createMessage,
    getMessage
}