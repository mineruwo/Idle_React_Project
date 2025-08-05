import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080";

const prefix = `${API_SERVER_HOST}/api/payment`;

export const payment = async (paymentEntity) => {
    const res = await axios.post(`${prefix}/`, paymentEntity);

    return res.data;
};
