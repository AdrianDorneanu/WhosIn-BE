import { ConflictException, Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { SignupDto } from "./dto/signup.dto";
import { SignupResponseDto } from "./dto/signup-response.dto";

@Injectable()
export class AuthService {
	constructor(private readonly prisma: PrismaService) {}

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

	private async hashPassword(password: string): Promise<string> {
		return argon2.hash(password);
	}
}
