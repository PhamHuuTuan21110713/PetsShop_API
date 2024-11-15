import Redis from 'ioredis';
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
    host: process.env.REDIS_HOST_NAME, // Hostname từ RedisCloud
    port: process.env.REDIS_PORT, // Port từ RedisCloud
    password: process.env.REDIS_PASSWORD, // Password từ RedisCloud
});

redis.on('connect', () => {
    console.log('Đã kết nối tới RedisCloud!');
});

redis.on('error', (err) => {
    console.error('Lỗi Redis:', err);
});

const set = async (key, value, ttl) => {
    await redis.set(key, value, 'EX', ttl); 
    console.log(`Đã lưu value: ${value} với key: ${key}`);
}

const get = async (key) => {
    const value = await redis.get(key); 
    return value;
};

const del = async (key) => {
    await redis.del(key);
    console.log('Key đã được xóa.');
}

const checkExist = async (key) => {
    const exists = await redis.exists(key);
    console.log(exists ? 'Key tồn tại' : 'Key không tồn tại');
}
const disConnect = () => {
    redis.quit();
}

export default {
    set,
    get,
    del,
    checkExist,
    disConnect
}