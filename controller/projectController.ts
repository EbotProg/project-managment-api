import { Handler, NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import Project from "../db/models/project";
import cookie from 'cookie';
import { IGetUserAuthInfoRequest } from "./authController";
import User from "../db/models/user";
import AppError from "../utils/AppError";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const getAllProjects: Handler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {

        try{

            const projects = await new Promise((resolve, reject) => {

                Project.findAll({ include: { all: true}}).then((results) => {

                    // console.log('results', results)
                    results.forEach((item) => {
                        item.timeToDeadline = dayjs(new Date()).to(new Date(item.deadline), true);
                    })
                    resolve(results);
                    // result.forEach((item)=> {
                    //     console.log('project item', item);
                    //     console.log('deadline', item.deadline)
                    //     console.log(',,,,,,,,,')
                    //     console.log('time to deadline', dayjs(new Date()).to(new Date(item.deadline), true))
                    //     item.timeToDeadline = dayjs(new Date()).to(new Date(item.deadline), true)
                    // })
                    // const newArr: Array<object> = []
                    // for( let result of results) {
                    //     let obj = Object.assign({}, result)
                    //     obj.timeToDeadline = dayjs(new Date()).to(new Date(obj.deadline), true);
                    // }
    
                    
                });
            })
             

           
            res.status(200).json({
                status: 'success',
                message: 'projects fetched successfully',
                data: {
                    projects
                }
            })

        }catch(err) {
            next(err);
        }
    }
)


const createNewProject: Handler = catchAsync(
    async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
        try {
            const { file} = req;
            console.log('file', file);
            const user = req.user?.toJSON()
            delete user?.password
            const body = req.body
console.log('=======1')

            const creator = await User.findOne({ where : { }});
            if(!creator) {
                return next(new AppError("You are not authorized to perform this action", 401))
            }
            if(!user) {
                return next(new AppError("Please login", 401))
            }
           
            const projectHandler = await User.findOne({ where: { firstName: body?.handler}})

            if(!projectHandler) {
                return next(new AppError('project handler not found', 404))
            }
            console.log('=======2')
            console.log('creator', creator);
            console.log('handler', projectHandler)
            const newProject = await Project.create({
                name: body.name,
                description: body.description,
                creatorId: creator?.id, 
                status: body?.status,
                // createdBy: creator,
                handlerId: projectHandler.id,
                // handledBy: projectHandler,
                deadline: new Date(body.deadline),
            })
            console.log('new project', newProject)


            console.log('=======3')

            

            res.status(200).json({
                status: 'success' ,
                message: 'project created', 
                data: {
                    project: newProject
                }
            })
        }catch(err) {
            // console.log('createProjectErr', err)
            next(err);
        }
    }
)

const updateProject: Handler = catchAsync(
    async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {

        const id = Number(req.params.id);

        const project = await Project.findOne({ include: { all: true}, where: { id}});
        console.log('project', project)

        if(!project) {
            return next(new AppError('project not found', 404))
        }

        if(!req.user) {
            return next(new AppError('please login', 401))
        }

        // console.log('createdbyid, userid, handledbyid', project.createdBy.id, req.user.id, project.handledBy.id)
        // console.log('booleans created=user, handled==user', project.createdBy.id !== req.user.id, project.handledBy.id !== req.user.id)
        if(project.createdBy.id !== req.user.id && project.handledBy.id !== req.user.id) {
            return next(new AppError('Forbidden', 403))
        }

        const updatedProject = await Project.update({ ...req.body }, { where: { id } })


        /////////////

        
        ////////////////

        res.status(200).json({
            status: 'success',
            message: 'projected updated',
            data: {
                updatedProject
            }
        })
    }
)

const deleteProject: Handler = catchAsync(
    async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {

        const id = Number(req.params.id);

        const project = await Project.findOne({ include : { all: true }, where: { id }});

        if(!project) {
            return next(new AppError('project not found', 404))

        }

        if(!req.user) {
            return next(new AppError('please login', 401))
        }

        if(project.createdBy.id !== req.user.id && project.handledBy.id !== req.user.id) {
            return next(new AppError('Forbidden', 403))
        }

        await Project.destroy({
            where: {
                id
            }
        })

        res.status(200).json({
            message: 'project deleted'
        })
    }
)


export { getAllProjects, createNewProject, updateProject, deleteProject }