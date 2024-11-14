import ShopInformation from "~/models/ShopInformationModel";

const getInformationById = (id) => {
    return new Promise(async (rs, rj) => {
        try{
            const data = await ShopInformation.findById(id);
            if(data) {
                rs({
                    status: "OK",
                    message: "Lay thong tin cua hang thanh cong",
                    data
                })
            } else {
                rj({
                    status: "ERR",
                    message: `Khong ton tai du lieu voi ID: ${id} `,
                })
            }
        }catch(err) {
            rj(err);
        }
    })
}

const createInformation = (data) => {
    return new Promise(async (rs, rj) => {
        try {
            const infor = await ShopInformation.create(data);
            if(infor) {
                rs({
                    status: "OK",
                    message: "Tao thong tin cua hang thanh cong",
                    data: infor
                })
            }
        }catch(err) {
            rj(err)
        }
    })
}

export default {
    getInformationById,
    createInformation
}