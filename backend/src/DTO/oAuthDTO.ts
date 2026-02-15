import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OAuthDTO {
  @IsNotEmpty()
  @IsString()
  googleId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
