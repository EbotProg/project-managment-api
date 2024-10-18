import { Router } from "express";
import { generateNewAccessToken, login, logout, signUp } from "../controller/authController";

const router: Router = Router();

router.route('/signup').post(signUp);
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/generate-new-access-token').post(generateNewAccessToken)

export default router;