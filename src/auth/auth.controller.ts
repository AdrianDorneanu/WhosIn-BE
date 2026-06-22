import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { SignupResponseDto } from "./dto/signup-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("signup")
	@ApiCreatedResponse({ type: SignupResponseDto })
	signUp(@Body() signupDto: SignupDto): Promise<SignupResponseDto> {
		return this.authService.signUp(signupDto);
	}
}
