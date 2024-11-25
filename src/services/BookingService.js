import mongoose from "mongoose";
import Booking from "~/models/BookingModel";

const getById = (id) => {
    return new Promise(async (rs, rj) => {
        try {
            const booking = await Booking.findById(id);
            if (booking.state === true) {
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
        } catch (err) {
            rj(err);
        }
    })
}

const createNew = (data) => {
    return new Promise(async (rs, rj) => {
        try {
            const booking = await Booking.create(data);
            if (booking) {
                rs({
                    status: "OK",
                    message: "Tạo đơn dịch vụ thành công",
                    data: booking
                })
            }
        } catch (err) {
            rj(err);
        }
    })
}

const getAll = (userId, filter, finding) => {

    return new Promise(async (rs, rj) => {
        try {
            let _filter = JSON.parse(filter);
            if (_filter.year) {
                // console.log("_ffff: ", _filter)
                const startOfYear = new Date(`${parseInt(_filter.year)}-01-01T17:46:04.630+00:00`);
                const endOfYear = new Date(`${parseInt(parseInt(_filter.year) + 1)}-01-01T17:46:04.630+00:00`);
                _filter = {
                    ..._filter,
                    "bookingDate": {
                        $gte: startOfYear,
                        $lt: endOfYear
                    }
                }
                delete _filter.year
            }

            let condition = {}
            if (userId !== "") {
                const _userId = new mongoose.Types.ObjectId(userId);
                if (finding !== "") {
                    const _finding = new mongoose.Types.ObjectId(finding);
                    condition = {
                        ..._filter,
                        userId: _userId,
                        _id: _finding
                    }
                } else {
                    condition = {
                        ..._filter,
                        userId: _userId,
                    }
                }

            } else {
                if (finding !== "") {
                    const _finding = new mongoose.Types.ObjectId(finding);
                    condition = {
                        ..._filter,
                        userId: _userId,
                        _id: _finding
                    }
                } else {
                    condition = {
                        ..._filter,
                        userId: _userId,
                    }
                }
            }
            const data = await Booking.aggregate([
                {
                    $match: condition
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "serviceDetails"
                    }
                },
                {
                    $addFields: {
                        serviceDetails: { $arrayElemAt: ["$serviceDetails", 0] } // Lấy phần tử đầu tiên
                    }
                }
            ])
            if (data) {
                rs({
                    status: "OK",
                    message: "Lấy danh sách đơn dịch vụ thành công",
                    data
                })
            }
        } catch (err) {
            console.log("ERR:", err)
            rj(err)
        }
    })
}
export default {
    getById,
    createNew,
    getAll
}