import { Injectable } from '@nestjs/common';
import { googleService } from './google/googleService';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly googleService : googleService,
        private readonly userService : UserService
    ){}

    async loginWithGoogle(idToken : string){
        const googleUser = await this.googleService.verify(idToken);
        const user = await this.userService.findOrCreateByGoogleid(googleUser);
        return {
            user,
        } 
    }
}
