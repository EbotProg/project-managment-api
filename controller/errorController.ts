import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";


const sendErrorDev = (error: any, res: Response) => {

    try{
        const statusCode = error.statusCode || 500;
        const status = error.status || 'error';
        const message = error.message;
        const stack = error.stack;
    
         res.status(statusCode).json({
            status, 
            message,
            stack
        })
    } catch(err) {
        console.error('sendErrorDev err', err)
    }
   
}


const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    // console.log('valer', err)
    try{
        if(err.name === 'SequelizeUniqueConstraintError') {
            err = new AppError(err.errors[0].message, 500)
        }
        if(err.name === 'SequelizeValidationError') {
            err = new AppError(err.errors[0].message, 500)
        }
        if(err.name === 'TokenExpiredError') {
            err = new AppError('please login', 401)
        }
        
        return sendErrorDev(err, res);
        
    }catch(err) {
        console.error('globalErrorHandler err', err)
    }
    
}


export default globalErrorHandler;