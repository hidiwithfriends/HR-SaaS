import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { StoreType } from '../../../entities/store.entity';

export class SignupOwnerDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  storeName: string;

  @IsEnum(StoreType)
  storeType: StoreType;
}
