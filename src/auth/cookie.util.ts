import { Response } from 'express';

const REFRESH_COOKIE_NAME = 'refresh_token';

export function setRefreshTokenCookie(res : Response, token : string){
    res.cookie(REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path : '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}  

export function clearRefreshTokenCookie(res : Response){
    res.clearCookie(REFRESH_COOKIE_NAME, {
        path : '/auth/refresh',
    });
}