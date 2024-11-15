import Booking from "~/models/BookingModel";

const getById = (id) => {
    return new Promise(async (rs,rj) => {
        try {
            const booking = await Booking.findById(id);
            if(booking) {
                rs({
                    status: "OK",
                    message: "Lấy đơn dịch vụ thành công",
                    data: booking
                })
            } else {
                rj({
                    status: "ERR",
                    message: `Không tồn tại đơn dịch vụ: ${id}`
                })
            }
        }catch(err) {
            rj(err);
        }
    })
}

const createNew = (data) => {
    return new Promise (async (rs,rj) => {
        try {
            const booking = await Booking.create(data);
            if(booking) {
                rs({
                    status: "OK",
                    message: "Tạo đơn dịch vụ thành công",
                    data: booking
                })
            }
        }catch(err) {
            rj(err);
        }
    })
}

const getAll = () => {
    return new Promise(async(rs, rj) => {
        try {
            const data = await Booking.find();
            if(data) {
                rs({
                    status: "OK",
                    message:"Lấy danh sách đơn dịch vụ thành công",
                    data
                })
            }
        }catch(err) {
            rj(err)
        }
    })
}
export default {
    getById,
    createNew,
    getAll
}