import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpWithPasswordDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export enum OAuthProvider {
  google = 'google',
  apple = 'apple',
}

export class SignUpWithOAuthDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  email!: string;

  @IsEnum(OAuthProvider)
  provider!: OAuthProvider;

  @IsString()
  @IsNotEmpty()
  sub!: string;
}

export class LoginPayloadDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}

export class TokenPayloadDto {
  @IsString()
  userId!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  iat?: number;

  @IsOptional()
  exp?: number;
}
