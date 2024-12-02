import mongoose from "mongoose";
import PromotionService from "~/services/PromotionService";

const getAllPromotions = async (req, res) => {
    try {
        const query = req.query;

        // Parse filters từ chuỗi JSON thành đối tượng
        let filters = {};
        if (query.filters) {
            filters = JSON.parse(query.filters);
        }
        console.log("filter: ",filters)
        const { outdated = "none", ...others } = filters;
        console.log("Promotion query: ", outdated);  // Kiểm tra giá trị outdated
        console.log("Promotion other filters: ", others);  // Kiểm tra các giá trị khác trong filters

        const response = await PromotionService.getAllPromotions(outdated, others);  // Gọi service với giá trị đã cập nhật
        if (response) return res.status(200).json(response);
    } catch (err) {
        return res.status(404).json(err);
    }
};

const createPromotion = (req, res) => {
    const dataPromotion = req.body;
  
    // Kiểm tra dữ liệu đầu vào
    if (!dataPromotion.name || !dataPromotion.type || !dataPromotion.value || !dataPromotion.startDate || !dataPromotion.endDate || !dataPromotion.desc) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Thiếu thông tin bắt buộc.',
      });
    }
  
    // Hàm chuyển đổi ngày tháng từ chuỗi "dd/mm/yyyy" sang "yyyy-mm-dd"
    const convertToISODate = (dateString) => {
      const [day, month, year] = dateString.split('/');
      return `${day}-${month}-${year}`;
    };
  
    // Kiểm tra và chuyển đổi các ngày
    try {
      dataPromotion.startDate = new Date(convertToISODate(dataPromotion.startDate));
      dataPromotion.endDate = new Date(convertToISODate(dataPromotion.endDate));
  
      // Kiểm tra tính hợp lệ của ngày
      if (isNaN(dataPromotion.startDate.getTime()) || isNaN(dataPromotion.endDate.getTime())) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Ngày tháng không hợp lệ.',
        });
      }
    } catch (error) {
      console.error("Date conversion error:", error);  // Log chi tiết lỗi
      return res.status(400).json({
        status: 'ERROR',
        message: 'Ngày tháng không hợp lệ.',
      });
    }
  
    // Chuyển đổi value từ chuỗi thành số
    const value = parseInt(dataPromotion.value, 10);
  
    // Chuyển applicableProducts thành mảng ObjectId
    let applicableProducts = [];
    if (typeof dataPromotion.applicableProducts === 'string') {
      applicableProducts = dataPromotion.applicableProducts
        .split(',')
        .map((id) => new mongoose.Types.ObjectId(id.trim()));
    } else if (Array.isArray(dataPromotion.applicableProducts)) {
      applicableProducts = dataPromotion.applicableProducts.map((id) => new mongoose.Types.ObjectId(id));
    }
  
    console.log("description", dataPromotion.desc);
    
    // Gọi Service để tạo khuyến mãi mới
    PromotionService.createPromotion({
      name: dataPromotion.name,
      description: dataPromotion.desc,
      type: dataPromotion.type,
      value: value,
      startDate: dataPromotion.startDate,
      endDate: dataPromotion.endDate,
      applicableProducts: applicableProducts,
      state: true,
    })
      .then((promotion) => {
        res.status(200).json({
          status: 'OK',
          message: 'Tạo chương trình khuyến mãi thành công',
          promotion: promotion,
        });
      })
      .catch((error) => {
        console.error("Error from service:", error);  // Log chi tiết lỗi
        res.status(500).json({
          status: 'ERROR',
          message: 'Lỗi khi tạo khuyến mãi.',
          error: error.message || error,  // Trả lại lỗi chi tiết
        });
      });
  };

// const createPromotion = async (req, res) => {
//     const data = req.body;
//      console.log("data request promotion: ", data);
//     try {
//         if(data) {
//             const response = await PromotionService.createPromotion(data);
//             return res.status(201).json(response);
//         }
//     }catch(err) {
//         console.log("Promotion create err: ", err)
//        return res.status(404).json(err)
//     }
// }


// // Controller tạo Promotion
// const createPromotion = async (req, res) => {
//     try {
//         const data = req.body;

//         console.log("data o day: ", data);


//         // Kiểm tra các trường bắt buộc
//         if (!data.name || !data.desc || !data.type || !data.value || !data.startDate || !data.endDate || !data.applicableProducts) {
//             return res.status(400).json({
//                 message: 'All fields are required: name, description, type, value, startDate, and endDate.'
//             });
//         }

//         const value = Number(data.value);  // Chuyển đổi value sang số

//         if (isNaN(value)) {
//             return res.status(400).json({
//                 message: 'Value must be a valid number.'
//             });
//         }

//         const formatDate = (dateString) => {
//             const [day, month, year] = dateString.split('/');
//             return new Date(`${year}-${month}-${day}`);
//         };
        
//         const startDate = formatDate(data.startDate);
//         const endDate = formatDate(data.endDate);
        
//         if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//             return res.status(400).json({
//                 message: 'Start date and End date must be valid dates.'
//             });
//         }

//         // Gọi service để tạo Promotion
//         const newPromotion = await PromotionService.createPromotion(data);

//         // Trả về kết quả
//         res.status(201).json({
//             message: 'Promotion created successfully!',
//             promotion: newPromotion
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({
//             message: error.message || 'Something went wrong!'
//         });
//     }
// };



const getPromotionById = async (req, res) => {
    const id = req.params.id;
    try {
        const response = await PromotionService.getPromotionById(id);
        if (response) return res.status(200).json(response);
    } catch (err) {
        return res.status(404).json(err);
    }
}

// Controller cập nhật trạng thái đơn hàng
const updatePromotion = async (req, res) => {
  const id = req.params.id;  
  const { state } = req.body;

  console.log("lần đầu thử như này: ", req.body);
  
  console.log("du lieu: ", id, state);

  

  try {

      // Gọi service để cập nhật trạng thái đơn hàng
      const updatedPromotion = await PromotionService.updateStatus(id, state);

      if (!updatedPromotion) {
          return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
      }

      // Trả về thông tin đơn hàng đã được cập nhật
      res.status(200).json(updatedPromotion);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' });
  }
};

export default {
    createPromotion,
    getAllPromotions,
    getPromotionById,
    updatePromotion
}