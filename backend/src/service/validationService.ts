import joi from "joi";
import { IRegisterRequestBody } from "../types/userType";



export const validateRegisterBody = joi.object<IRegisterRequestBody>({
    name: joi.string().min(2).max(72).trim().required(),
    emailAddress: joi.string().email().required(),
    phoneNumber: joi.string().min(8).max(24).trim().required(),
    password: joi.string().min(4).max(20).required(),
    consent: joi.boolean().valid(true).required()
})

export const validateJoiSchema = <T>(scheme: joi.Schema, value: unknown) => {
const result=scheme.validate(value)
return{
    value:result.value as T,
    error :result.error
}
}