import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class SignupDto {
	@ApiProperty({ example: "adrian@example.com" })
	@IsEmail()
	email!: string;

	@ApiProperty({ example: "Adrian" })
	@IsString()
	@MinLength(2)
	displayName!: string;

	@ApiProperty({ minLength: 8, example: "super-secret-password" })
	@IsString()
	@MinLength(8)
	password!: string;
}
