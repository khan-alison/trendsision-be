import { HttpException, HttpStatus } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

export const generateAccessJWT = (data, options = {}) => {
    const key = process.env.ACCESS_JWT_SECRET_KEY;
    return jwt.sign(data, key, options);
};

export const verifyAccessJWT = async (token, options = {}) => {
    const key = process.env.ACCESS_JWT_SECRET_KEY;
    try {
        return await jwt.verify(token, key, options);
    } catch (err) {
        if (err.message === "jwt expired") {
            throw new HttpException("Token expired", HttpStatus.UNAUTHORIZED);
        } else {
            throw err;
        }
    }
};

export const generateRefreshJWT = (data, options = {}) => {
    const key = process.env.REFRESH_JWT_SECRET_KEY;
    return jwt.sign(data, key, options);
};

export const verifyRefreshJWT = async (token, options = {}) => {
    const key = process.env.REFRESH_JWT_SECRET_KEY;
    try {
        return await jwt.verify(token, key, options);
    } catch (err) {
        if (err.message === "jwt expired") {
            throw new HttpException("Token expired", HttpStatus.UNAUTHORIZED);
        } else {
            throw err;
        }
    }
};

export const generateResetJWT = (data, options = {}) => {
    const key = process.env.RESET_JWT_SECRET_KEY;
    return jwt.sign(data, key, options);
};

export const verifyResetPasswordToken = async (token, options = {}) => {
    const key = process.env.RESET_JWT_SECRET_KEY;
    try {
        return await jwt.verify(token, key, options);
    } catch (err) {
        if (err.message === "jwt expired") {
            throw new HttpException("Token expired", HttpStatus.UNAUTHORIZED);
        } else {
            throw err;
        }
    }
};
