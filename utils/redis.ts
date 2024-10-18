import { createClient } from "redis";

export async function connectToRedis () {
    return await createClient()
    .on('error', err=> console.log('redis client error', err))
    .connect()
}



//{ url: "redis://default:Jesus!@123@redis-16483.c89.us-east-1-3.ec2.redns.redis-cloud.com:16483"}