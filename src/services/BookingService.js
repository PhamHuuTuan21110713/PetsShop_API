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

const getAll = (userId, filter, finding, sorting,page,limit) => {

    return new Promise(async (rs, rj) => {
        try {
            let _filter = JSON.parse(filter);
            let _sorting = {
                bookingDate: -1 // Sắp xếp giảm dần theo bookingDate
            };
            let _page = null; let _limit = null;
            if(page){
                _page = parseInt(page)
            }
            if(limit) {
                _limit = parseInt(limit);
            }
            if (sorting) {
                const _sort = JSON.parse(sorting)
                _sorting = {..._sort}; 
            }
            console.log("filter: ", _filter);
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
                        _id: _finding
                    }
                } else {
                    condition = {
                        ..._filter,
                    }
                }
            }
            let { serviceId } = _filter;
            if(serviceId) {
                // console.log("serviceid: ", serviceId);
                const reId = new mongoose.Types.ObjectId(serviceId);
                condition = {
                    ...condition,
                    serviceId: reId
                }
            }
            const pepline = [
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
                },
                {
                    $sort: _sorting
                }
                
            ]
            if( _page && _limit) {
                pepline.push(
                {
                    $skip: (_page - 1) * _limit // Bỏ qua các bản ghi của các trang trước
                },
                {
                    $limit: _limit // Lấy số lượng bản ghi cho trang hiện tại
                })
            }
            let totalCount = 0;
            let totalPages = 1;
            if(_page && _limit) {
                const totalDocs = await Booking.aggregate([
                    { $match: condition },
                    { $count: "total" } // Đếm tổng số document khớp với điều kiện
                ]);
                
                // Lấy số lượng document (nếu không có document, mặc định là 0)
                totalCount = totalDocs.length > 0 ? totalDocs[0].total : 0;
                totalPages = _limit ? Math.ceil(totalCount / _limit) : 1;
            }
             
            const data = await Booking.aggregate(pepline)
            if (data) {
                if(_limit && _page) {
                    rs({
                        status: "OK",
                        message: "Lấy danh sách đơn dịch vụ thành công",
                        data,
                        totalDocs: totalCount,
                        totalPages: totalPages,
                        page: _page
                    })
                } else {
                    rs({
                        status: "OK",
                        message: "Lấy danh sách đơn dịch vụ thành công",
                        data
                    })
                }
               
            }
        } catch (err) {
            console.log("ERR:", err)
            rj(err)
        }
    })
}

const update = (id,data) => {
    return new Promise(async (rs, rj) => {
        try {
            const booking = await Booking.findByIdAndUpdate(id,data);
            if(booking) {
                rs({
                    status: "OK",
                    message:"Cập nhật thông tin thành công",
                    data: booking
                })
            } else {
                rj({
                    status: "ERR",
                    message: "Không tìm thấy thông tin"
                })
            }
        }catch(err) {
            console.log(err);
            rj(err);
        }
    })
}
export default {
    getById,
    createNew,
    getAll,
    update
}