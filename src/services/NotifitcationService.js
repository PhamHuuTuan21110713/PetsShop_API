import Notification from "~/models/NotificationModel"
const createNotification = (data) => {
    return new Promise(async (rs, rj) => {
        try {
            const notification = await Notification.create(data);
            rs({
                status: "OK",
                message: "Tạo thông báo thành công",
                data: notification
            })
        } catch (err) {
            rj(err);
        }
    })
}

const updateNotification = (id, data) => {
    return new Promise(async (rs, rj) => {
        try {
            const notification = await Notification.findByIdAndUpdate(id, data, { new: true });
            if (notification) {
                rs({
                    status: "OK",
                    message: "Cập nhật thông báo thành công",
                    data: notification
                })
            } else {
                rj({
                    status: "ERR",
                    message: "Không tồn tại thông báo",
                })
            }

        } catch (err) {
            rj(err);
        }
    })
}

const findNotification = (condition,state) => {
    return new Promise(async (rs, rj) => {
        try {
            // console.log("mystate: ", state);
            let _condition = {
                state: state
            };
            
            if (condition) {
                _condition = {
                    ..._condition,
                    ...condition
                }
            }
            if (condition.isReading) {

                const pars = JSON.parse(condition.isReading)
                console.log("parsed isreading: ", pars);
                _condition = {
                    ..._condition,
                    isReading: pars
                }
            }
            console.log("final condition: ", _condition);
            const notification = await Notification.find(_condition).sort({ createdAt: -1 });
            if (notification) {
                rs({
                    status: "OK",
                    message: "Lấy thông báo thành công",
                    data: notification
                })
            } else {
                rj({
                    status: "ERR",
                    message: "Không tồn tại thông báo",
                })
            }

        } catch (err) {
            rj(err);
        }
    })
}

const findNotificationById = (id) => {
    return new Promise(async (rs, rj) => {
        try {
            const notification = await Notification.findById(id);
            if (notification) {
                rs({
                    status: "OK",
                    message: "Lấy thông báo thành công",
                    data: notification
                })
            } else {
                rj({
                    status: "ERR",
                    message: "Không tồn tại thông báo",
                })
            }

        } catch (err) {
            rj(err);
        }
    })
}

const deleteNotification = (id) => {
    return new Promise(async (rs, rj) => {
        try {
            const notification = await Notification.findByIdAndUpdate(id, {
                state: false
            },
                { new: true });
            if (notification) {
                rs({
                    status: "OK",
                    message: "Xóa thông báo thành công",
                    data: notification
                })
            } else {
                rj({
                    status: "ERR",
                    message: "Không tồn tại thông báo",
                })
            }

        } catch (err) {
            rj(err);
        }
    })
}

const updateMany = (senderId, receiverId, type, data) => {
    return new Promise(async (rs, rj) => {
        try {
            if(type === "message") {
                const deletes = await Notification.deleteMany(
                    {
                        senderId,
                        receiverId,
                        type
                    }
                )
                if(deletes) {
                    rs({
                        status:"OK",
                        message:"Cập nhật thành công"
                    })
                }
            }

        } catch (err) {
            rj(err);
        }
    })
}

export {
    createNotification,
    updateNotification,
    findNotification,
    deleteNotification,
    findNotificationById,
    updateMany
};