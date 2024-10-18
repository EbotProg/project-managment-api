import express, { Application, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config({
    path: `${process.cwd()}/.env`
  });
import checkEnvVarialbles from './utils/checkEnvVarialbes';
import {connect} from './db/models';
import authRouter from './route/authRoute';
import projectRouter from './route/projectRoute';
import globalErrorHandler from './controller/errorController';
import catchAsync from './utils/catchAsync';
import AppError from './utils/AppError';
import cookieParser from 'cookie-parser';


checkEnvVarialbles()

const app: Application = express();



app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/auth/', authRouter)
app.use('/api/v1/projects/', projectRouter)

app.get('/', (req: Request, res: Response) => {
    
    res.status(200).json({
        status: 'success',
        message: 'application running wooh!'
    })
})




app.use(globalErrorHandler)

    connect().then(()=>{
        let port: number = Number(process.env.APP_PORT) || 4000;
        app.listen(port, ()=> {
            console.log(`server running on http:localhost:${port}`);
        })
    }).catch(err => {
        console.error(err)
    })

    app.use('*', catchAsync(async (req: Request, res: Response, next: NextFunction)=> {
        return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)) 
    }))



