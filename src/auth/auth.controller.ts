import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { SignupResponseDto } from "./dto/signup-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { JwtPayload } from "./types/jwt-payload.type";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("signup")
	@ApiCreatedResponse({ type: SignupResponseDto })
	signUp(@Body() signupDto: SignupDto): Promise<SignupResponseDto> {
		return this.authService.signUp(signupDto);
	}

	@Post("login")
	@ApiOkResponse({ type: AuthResponseDto })
	login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
		return this.authService.login(loginDto);
	}

	@Get("me")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse({ type: SignupResponseDto })
	getMe(@CurrentUser() user: JwtPayload): Promise<SignupResponseDto> {
		return this.authService.getMe(user.sub);
	}
}
