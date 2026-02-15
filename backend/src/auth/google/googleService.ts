import { Injectable, UnauthorizedException } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class googleService{
    private client : OAuth2Client;

    constructor(){
        this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    async verify(idToken : string) : Promise<{
        googleId : string,
        email : string,
        name : string
    }>{
        try{
            const ticket = await this.client.verifyIdToken({
                idToken,
                audience : process.env.GOOGLE_CLIENT_ID
            });
            const paylaod = ticket.getPayload();
            if(!paylaod){
                throw new UnauthorizedException('Invalid google token payload')
            }

            return {
                googleId : paylaod.sub,
                email : paylaod.email!, // ! means that email is not undefined
                name : paylaod.name ?? '' // ?? means that name if null can be taken as ''
            }
        } catch{
            throw new UnauthorizedException('Invalid google token')
        }
    }
}