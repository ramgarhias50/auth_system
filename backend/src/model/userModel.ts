import mongoose from "mongoose";
import { IUser } from "../types/userType";
import { EUserRole } from "../constant/userConstant";

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        minlength: 2,
        maxlength: 72,
        required: true
    },
    emailAddress: {
        type: String,
        unique: true,
        required: true,
    },
    phoneNumber: {
        _id: false,
        isoCode: {
            type: String,
            require: true,
        },
        countryCode: {
            type: String,
            required: true
        },
        internationalNumber: {
            type: String,
            required: true
        }
    },
    timezone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        default: EUserRole.USER,
        enum: EUserRole,
        required: true
    },
    accountConfimation: {
        _id: false,
        status: {
            type: Boolean,
            default: false,
            required: true
        },
        token: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: null
        }
    },
    passwordReset: {
        _id: false,
        token: {
            type: String,
            default: null
        },
        expire: {
            type: Number,
            default: null
        },
        lastRestAt: {
            type: Date,
            default: null
        }
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    consent: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
})

export default mongoose.model<IUser>('user',userSchema);
