import { Injectable } from "@nestjs/common";

@Injectable()
export class googleService{
    async verify(idToken : string){
        return {} as any;
    }
}