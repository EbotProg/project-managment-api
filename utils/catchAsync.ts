import { NextFunction, Request, Response } from "express"


const catchAsync = (fn: Function) => {
    const errorHandler = (req: Request, res: Response, next: NextFunction) => {
        
        fn(req, res, next).catch(next)
    }
    return errorHandler;
}

export default catchAsync;