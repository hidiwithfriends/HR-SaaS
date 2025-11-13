import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SignupOwnerDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요' })
  @IsNotEmpty({ message: '이메일은 필수입니다' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수입니다' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: '비밀번호는 영문과 숫자를 포함해야 합니다',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '이름은 필수입니다' })
  @MaxLength(100, { message: '이름은 최대 100자까지 입력 가능합니다' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '매장명은 필수입니다' })
  @MaxLength(200, { message: '매장명은 최대 200자까지 입력 가능합니다' })
  storeName: string;
}
