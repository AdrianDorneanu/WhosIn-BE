import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { SignupResponseDto } from "./dto/signup-response.dto";
import { JwtPayload } from "./types/jwt-payload.type";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	async signUp(signupDto: SignupDto): Promise<SignupResponseDto> {
		const existingUser = await this.prisma.user.findUnique({
			where: { email: signupDto.email },
			select: { id: true },
		});

		if (existingUser) {
			throw new ConflictException("Email is already in use");
		}

		const passwordHash = await this.hashPassword(signupDto.password);
		const user = await this.prisma.user.create({
			data: {
				email: signupDto.email,
				displayName: signupDto.displayName,
				passwordHash,
			},
			select: {
				id: true,
				email: true,
				displayName: true,
				status: true,
				createdAt: true,
			},
		});

		return user;
	}

	async login(loginDto: LoginDto): Promise<AuthResponseDto> {
		const user = await this.prisma.user.findUnique({
			where: { email: loginDto.email },
			select: {
				id: true,
				email: true,
				displayName: true,
				status: true,
				createdAt: true,
				passwordHash: true,
			},
		});

		if (!user?.passwordHash) {
			throw new UnauthorizedException("Invalid email or password");
		}

		const passwordMatches = await argon2.verify(user.passwordHash, loginDto.password);

		if (!passwordMatches) {
			throw new UnauthorizedException("Invalid email or password");
		}

		return this.createAuthTokens({
			sub: user.id,
			email: user.email,
		});
	}

	async getMe(userId: string): Promise<SignupResponseDto> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				displayName: true,
				status: true,
				createdAt: true,
			},
		});

		if (!user) {
			throw new UnauthorizedException("Authenticated user no longer exists");
		}

		return user;
	}

	private async hashPassword(password: string): Promise<string> {
		return argon2.hash(password);
	}

	private async createAuthTokens(payload: JwtPayload): Promise<AuthResponseDto> {
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: process.env.JWT_ACCESS_SECRET,
				expiresIn: ACCESS_TOKEN_EXPIRES_IN,
			}),
			this.jwtService.signAsync(payload, {
				secret: process.env.JWT_REFRESH_SECRET,
				expiresIn: REFRESH_TOKEN_EXPIRES_IN,
			}),
		]);

		return { accessToken, refreshToken };
	}
}
