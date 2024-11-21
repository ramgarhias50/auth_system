import { NextFunction, Request, Response } from 'express'
import httpResponse from '../util/httpResponse'
import responseMessage from '../constant/responseMessage'
import httpError from '../util/httpError'
import quicker from '../util/quicker'
import { IRegisterRequestBody, IUser } from '../types/userType'
import { validateJoiSchema, validateRegisterBody } from '../service/validationService'
import databaseService from '../service/databaseService'
import { EUserRole } from '../constant/userConstant'
import config from '../config/config'
import emailService from '../service/emailService'
import logger from '../util/logger'

interface IRegisterRequest extends Request {
    body: IRegisterRequestBody
}

export default {
    self: (req: Request, res: Response, next: NextFunction) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    health: (req: Request, res: Response, next: NextFunction) => {
        try {
            const healthData = {
                application: quicker.getApplicationHealth(),
                system: quicker.getSystemHealth(),
                timestamp: Date.now()
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, healthData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    register: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { body } = req as IRegisterRequest
            //TODO
            //Body validation
            const { error, value } = validateJoiSchema<IRegisterRequestBody>(validateRegisterBody, body)
            if (error) {
                return httpError(next, error, req, 422)
            }

            //Phone Number Parasing & Validation
            const { name,phoneNumber, emailAddress, password,consent } = value
            const { countryCode, internationalNumber, isoCode } = quicker.parsePhomneNumber('+' + phoneNumber)
            if (!countryCode || !internationalNumber || !isoCode) {
                return httpError(next, new Error(responseMessage.INVAILD_PHONE_NUMBER), req, 422)
            }
            //Timezone
            const timezone = quicker.countryTimezone(isoCode)
            if (!timezone || timezone.length === 0) {
                return httpError(next, new Error(responseMessage.INVAILD_PHONE_NUMBER), req, 422)
            }
            //Check user existence by email
            const user = await databaseService.findUserByEmailAddress(emailAddress)
            if (user) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('user', emailAddress)), req, 422)
            }
            //Encrypt Password
            const encryptedPassword = await quicker.hashedPassword(password)

            //Accound Confirmation
            const token = quicker.generateRandomId()
            const code = quicker.generateOtp(6)

            const payload:IUser={
                name,
                emailAddress,
                phoneNumber:{
                    countryCode,
                    isoCode,
                    internationalNumber
                },
                accountConfimation:{
                    status:false,
                    token,
                    code,
                    timestamp:null
                },
                passwordReset:{
                    token:null,
                    expire:null,
                    lastRestAt:null
                },
                lastLoginAt:null,
                role:EUserRole.USER,
                timezone:timezone[0].name,
                password:encryptedPassword,
                consent
            }
            //Createing User
            const newUser= await databaseService.registerUser(payload);
            //Send Email
            const confirmationUrl=`${config.FRONTEND_URL}/confirmation/${token}?code=${code}`
            const to= [emailAddress]
            const subject = 'Confirm Yout Account'
            const text=`Hey ${name},Please confim your account by click the given link \n \n ${confirmationUrl}`;
            emailService.sendEmail(to,subject,text).catch((err)=>{
                logger.error('EMIAL_SERVIVE',{
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    meta:err
                })
            })
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            httpResponse(req, res, 201, responseMessage.SUCCESS,{_id:newUser.id})
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}

