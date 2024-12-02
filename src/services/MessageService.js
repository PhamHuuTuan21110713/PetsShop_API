import Message from "~/models/MessageModel";

const createMessage = (data) => {
    return new Promise(async (rs,rj) => {
        try {
            const message = await Message.create(data);
            rs({
                status: "OK",
                message: "Đã tạo tin nhắn",
                data: message
            })
        } catch(err) {
            rj(err)
        }
    })
}

const getMessage = (chatId) => {
    return new Promise(async (rs,rj) => {
        try {
            const message = await Message.find({chatId});
            rs({
                status: "OK",
                message: "Lấy thông tin thành công",
                data: message
            })
        } catch(err) {
            rj(err)
        }
    })
}

export default {
    createMessage,
    getMessage
}