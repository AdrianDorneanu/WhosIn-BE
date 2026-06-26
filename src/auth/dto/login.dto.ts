import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
	@ApiProperty({ example: "adrian@example.com" })
	@IsEmail()
	email!: string;

	@ApiProperty({ minLength: 8, example: "super-secret-password" })
	@IsString()
	@MinLength(8)
	password!: string;
}
