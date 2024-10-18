import { Handler, NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import User from "../db/models/user";
import AppError from "../utils/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from 'bcrypt';
import cookie from 'cookie'
import  UserAttributes  from '../db/models/user';
import { connectToRedis } from "../utils/redis";




// 0 admin
// 1 seller
// 2 buyer

 export interface IGetUserAuthInfoRequest extends Request {
    user?: User // or any other type
  }


const generateToken: Function = (payload: JwtPayload, secret: string, expiresIn: string | number): string => {

    return jwt.sign(payload, secret, {
        expiresIn
    })
}

const signUp: Handler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    console.log('req', req.body);

    if(!['1', '2'].includes(req.body.userType)) {
        return next(new AppError('Invalid userType', 400))
    }

    let newUser;
    try{
        const saltRounds: number = 10
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(req.body.password, salt);
        console.log('hash', hash)
        const user = {...req.body};
        user.password = hash;
        newUser = await User.create(user);
    }catch(err) {
        return next(err)
    }
    
    if(!newUser) {
        return next(new AppError('Failed to create user', 400))
    }
    const result = newUser.toJSON()
    delete result.password;
    delete result.deletionDate;

    const payload = { id: result.id};
    const accessToken = generateToken(
        payload,
        process.env.JWT_ACCESS_TOKEN_SECRET,
        process.env.JWT_ACCESS_TOKEN_EXPIRES_IN
    );

    const refreshToken = generateToken(
        payload,
        process.env.JWT_REFRESH_TOKEN_SECRET,
        process.env.JWT_REFRESH_TOKEN_EXPIRES_IN
    )
    
    storeTokensInCookie(accessToken, refreshToken, res, next);

    return res.status(201).json({
        status: 'success',
        message: 'user created',
        data: {
            user: result,
            accessToken,
            refreshToken
        }
    })
})

const login: Handler = catchAsync(async(req: Request, res: Response, next: NextFunction) => {

    try {

        const email: string = req.body.email;
        const password: string = req.body.password;

        if(!email || !password) {
            return next(new AppError('Email and/or password is missing', 400))
        }
        const user = await User.findOne({ where: { email }});

        if(!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError('Incorrect email or password', 400))
        }

        // const passwordIsCorrect: boolean = await bcrypt.compare(password, user.password)

        // console.log('password is correct', passwordIsCorrect)
        // if(!passwordIsCorrect) {
        //     return next(new AppError('Incorrect email or password', 400))
        // }

        const payload: JwtPayload | string = { id: user.id};
        const accessToken: string = generateToken(
            payload,
            process.env.JWT_ACCESS_TOKEN_SECRET,
            process.env.JWT_ACCESS_TOKEN_EXPIRES_IN
        );
    
        const refreshToken: string = generateToken(
            payload,
            process.env.JWT_REFRESH_TOKEN_SECRET,
            process.env.JWT_REFRESH_TOKEN_EXPIRES_IN
        )

        console.log('before storing token')
        storeTokensInCookie(accessToken, refreshToken, res, next);

        return res.status(201).json({
            status: 'success',
            message: 'user logged in successfully',
            data: {
                accessToken, 
                refreshToken
            }
        })

    }catch(err) {
        console.error('login err', err)
        return next(err)
    }
})

const logout: Handler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {


       const accessToken = req.headers.authorization?.split(" ")[1];

       if(!accessToken) {
        return next(new AppError('no tokens provided', 400))
       }
        await blackListToken(accessToken);

        res.clearCookie('refreshToken');

        res.status(200).json({
            message: 'logged out successfully'
        })

    }catch(err) {
        return next(err);
    }
})

const blackListToken = async (tokenStr: string): Promise<void> => {
    const client = await connectToRedis()
    await client.set(`blacklist:${tokenStr}`, 'blacklisted',{ EX: 60*15})
}

const isTokenBlackListed = async (tokenStr: string): Promise<boolean> => {
    const client = await connectToRedis()
    const value = (await client.get(`blacklist:${tokenStr}`)) === 'blacklisted' ? true : false;
    console.log('istokenblacklisted, value', value, await client.get(`blacklist:${tokenStr}`))
    return value
}

const storeTokensInCookie = (accessToken: string | null, refreshToken: string | null, res: Response, next: NextFunction): void => {
    try {

        

        if(accessToken) {
            // res.setHeader('Set-Cookie', cookie.serialize('accessToken', accessToken, {
            //     httpOnly: true,
            //     secure: process.env.NODE_ENV === 'production', 
            //     sameSite: 'strict',
            //     maxAge: 15 * 60,
            //     path: '/'
            // }))
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 15 * 60,
                path: '/'
            })
            console.log('after access cookie setting')
        }
        
        if(refreshToken) {
            // res.setHeader('Set-Cookie', cookie.serialize('refreshToken', refreshToken, {
            //     httpOnly: true,
            //     secure: process.env.NODE_ENV === 'production', 
            //     sameSite: 'strict',
            //     maxAge: 60 * 60 * 24 * 7,
            //     path: '/'
            // }))
            // console.log('after refresh cookie setting')
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7,
                path: '/'
            })
        }
    
        
    }catch(err) {
        console.error('cookie err', err)
        next(err)
    }

    

    

}

const authentication = catchAsync(
    async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) : Promise<any> => {


        // let cookies = cookie.parse(req.headers.cookie || '');
        // const accessToken = cookies.accessToken;
        // console.log('accessToken', accessToken)

        console.log('signedcookies', req.signedCookies)
        console.log('cookies', req.cookies)

        const accessToken = req.headers.authorization?.split(' ')[1];
        console.log('accessToken', accessToken);

        

        if(!accessToken) {
            return next(new AppError('Please login', 401))
        }

        if((await isTokenBlackListed(accessToken)) === true) {
            return next(new AppError('Please login', 401))
        }
        const tokenDetails = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET!)
        
        if(typeof tokenDetails === 'string') {
            return next(new AppError('Invalid token format', 400))
        }
        
        const user = await User.findByPk(tokenDetails.id);

        if(!user) {
            return next(new AppError('User no longer exists', 400))
        }
        req.user = user;

        return next();

    }
)

const generateNewAccessToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {

        try{

            
            const cookies = req.cookies;
            const refreshToken = cookies.refreshToken || req.headers.authorization?.split(' ')[1];
            console.log('cookies', cookies)

            if(!refreshToken) {
                return next(new AppError('Please login', 401))
            }

            const tokenDetails = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET!);

            if(typeof tokenDetails === 'string') {
                return next(new AppError('Invalid token format', 400))
            }

            const id = tokenDetails.id;

            const user = await User.findByPk(id);
            if(!user) {
                return next(new AppError('user no longer exists', 400))
            }

            const accessToken: string = generateToken(
                { id },
                process.env.JWT_ACCESS_TOKEN_SECRET,
                process.env.JWT_ACCESS_TOKEN_EXPIRES_IN
            );

            storeTokensInCookie(accessToken, null, res, next);


            res.status(201).json({
                status: 'success',
                data: {
                    accessToken
                }
            })
        } catch(err) {
            console.log(err);
            next(err);
        }
    }
)


export { signUp, login, logout,  authentication, generateNewAccessToken }