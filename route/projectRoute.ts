import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../controller/authController";
import { createNewProject, deleteProject, getAllProjects, updateProject } from "../controller/projectController";
import multer from 'multer';
import fs from 'fs'
import parseFileName from "../utils/parseFileName";
import path from 'path'

//middleware

export const checkFileValidMW = (req: Request, res: Response, next: NextFunction) => {
    if(!req.file || !req.file.filename) {
        res.sendStatus(400);
        return;
    }

    next();
}

const multerStorage = multer.diskStorage({
    destination(_, file, callback) {
        const { base } = parseFileName(file.originalname);

        fs.promises.mkdir(path.join('uploads', base), { recursive: true})
            .then(() => {
                callback(null, `uploads/${base}`)
            })
    },
    filename: (_, file, cb) => cb(null, `full${parseFileName(file.originalname).ext}`)
})

export const upload = multer({ storage: multerStorage})

const router = Router();

router.route('/').get(authentication, getAllProjects)
               .post(authentication, upload.single('file'), createNewProject)
router.route("/:id").patch(authentication, updateProject)
                    .delete(authentication, deleteProject);
export default router;