import EmailService from "~/services/EmailService";
const sendPIN = async (req, res) => {
    try {
        const { receiveEmail } = req.body;
        const response = await EmailService.sendPIN(receiveEmail);
        return res.status(201).json(response);
    } catch (err) {
        res.status(404).json(err);
    }
}
const checkPIN = async (req, res) => {
    try {
        const { receiveEmail, pin } = req.body;
        const response = await EmailService.checkPIN(receiveEmail, pin);
        if(response) {
            res.status(200).json(response)
        }
    } catch (err) {
        res.status(404).json(err);
    }
}
export default {
    sendPIN,
    checkPIN
}