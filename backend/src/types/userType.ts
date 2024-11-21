import { EUserRole } from "../constant/userConstant"

export interface IRegisterRequestBody {
    name: string
    emailAddress: string
    phoneNumber: string
    password: string
    consent: boolean
}
export interface IUser {
    name: string
    emailAddress: string
    phoneNumber: {
        isoCode: string
        countryCode: string
        internationalNumber: string
    }
    timezone: string
    password: string
    role: EUserRole
    accountConfimation: {
        status: boolean
        token: string
        code: string
        timestamp: Date | null
    }
    passwordReset: {
        token: string | null
        expire: number | null
        lastRestAt: Date | null
    }
    lastLoginAt:Date|null
    consent:boolean
}