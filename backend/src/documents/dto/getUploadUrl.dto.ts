import { IsEmail, IsString } from 'class-validator';

export class GetUploadUrlDto {
  @IsString()
  filename: string;

  @IsString()
  @IsEmail()
  email: string;
}
