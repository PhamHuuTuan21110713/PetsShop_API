import Chat from "~/models/ChatModel";

const createChat = (firstId, secondId) => {
    return new Promise(async (rs, rj) => {
        try {
            const chat = await Chat.findOne({
                members: { $all: [firstId, secondId] }
            })
            if (chat) {
                return rs({
                    status: "EXIST",
                    message: "Chat đã tồn tại",
                    data: chat
                })
            }
            const newChat = await Chat.create({
                members: [firstId, secondId]
            })
            return rs({
                status: "OK",
                message: "Tạo chat thành công",
                data: newChat
            })
        } catch (err) {
            rj(err);
        }
    })
}

const findUserChats = (userId) => {
    return new Promise(async (rs, rj) => {
        try {
            const chats = await Chat.find({
                members: { $in: [userId] }
            })
            if (chats) {
                rs({
                    status: "OK",
                    message: "Lấy dữ liệu chat thành công",
                    data: chats
                })
            } else {
                rj({
                    status: "ERR",
                    message: "Không có dữ liệu",
                    data: chats
                })
            }
        } catch (err) {
            rj(err);
        }
    })
}

const findChat = (firstId, secondId) => {
    return new Promise(async (rs, rj) => {
        try {
            const chat = await Chat.find(
                {
                    members: { $all: [firstId, secondId] }
                }
            )
            if(chat) {
                rs({
                    stauts: "OK",
                    message:"Lấy dữ liệu thành công",
                    data: chat
                })
            } else {
                rj({
                    status: "ERR",
                    message: "Không tồn tại dữ liệu khớp với điều kiện"
                })
            }
        } catch (err) {
            rj(err);
        }
    })
}

export default {
    createChat,
    findUserChats,
    findChat
}