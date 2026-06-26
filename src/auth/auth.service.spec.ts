import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";

type CreateUserArgs = {
	data: { email: string; displayName: string; passwordHash: string };
};

type SignupResponse = {
	id: string;
	email: string;
	displayName: string;
	status: string;
	createdAt: Date;
};

type LoginUser = SignupResponse & {
	passwordHash: string | null;
};

describe("AuthService", () => {
	let service: AuthService;
	let prisma: {
		user: {
			findUnique: jest.Mock;
			create: jest.Mock<Promise<SignupResponse>, [CreateUserArgs]>;
		};
	};
	let jwtService: {
		signAsync: jest.Mock<Promise<string>>;
	};

	beforeEach(async () => {
		prisma = {
			user: {
				findUnique: jest.fn(),
				create: jest.fn<Promise<SignupResponse>, [CreateUserArgs]>(),
			},
		};
		jwtService = {
			signAsync: jest
				.fn<Promise<string>, Parameters<JwtService["signAsync"]>>()
				.mockResolvedValueOnce("access-token")
				.mockResolvedValueOnce("refresh-token"),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: PrismaService,
					useValue: prisma,
				},
				{
					provide: JwtService,
					useValue: jwtService,
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("creates a user for signUp", async () => {
		const createdUser = {
			id: "2a7ef42f-8a6d-4d1b-b093-37f4ff53385a",
			email: "adrian@example.com",
			displayName: "Adrian",
			status: "ACTIVE",
			createdAt: new Date("2026-06-22T17:30:00.000Z"),
		};

		prisma.user.findUnique.mockResolvedValue(null);
		prisma.user.create.mockResolvedValue(createdUser);

		await expect(
			service.signUp({
				email: "adrian@example.com",
				displayName: "Adrian",
				password: "password123",
			}),
		).resolves.toEqual(createdUser);

		const createArgs = prisma.user.create.mock.calls[0][0];

		expect(createArgs.data.email).toBe("adrian@example.com");
		expect(createArgs.data.displayName).toBe("Adrian");
		expect(createArgs.data.passwordHash).toEqual(expect.any(String));
	});

	it("throws when email already exists", async () => {
		prisma.user.findUnique.mockResolvedValue({ id: "existing-user-id" });

		await expect(
			service.signUp({
				email: "adrian@example.com",
				displayName: "Adrian",
				password: "password123",
			}),
		).rejects.toThrow("Email is already in use");
		expect(prisma.user.create).not.toHaveBeenCalled();
	});

	it("returns auth tokens for login with valid credentials", async () => {
		const passwordHash = await argon2.hash("password123");
		const user: LoginUser = {
			id: "2a7ef42f-8a6d-4d1b-b093-37f4ff53385a",
			email: "adrian@example.com",
			displayName: "Adrian",
			status: "ACTIVE",
			createdAt: new Date("2026-06-22T17:30:00.000Z"),
			passwordHash,
		};

		prisma.user.findUnique.mockResolvedValue(user);

		await expect(
			service.login({
				email: "adrian@example.com",
				password: "password123",
			}),
		).resolves.toEqual({
			accessToken: "access-token",
			refreshToken: "refresh-token",
		});
		expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
		expect(jwtService.signAsync).toHaveBeenCalledWith(
			{ sub: user.id, email: user.email },
			expect.objectContaining({ expiresIn: "15m" }),
		);
		expect(jwtService.signAsync).toHaveBeenCalledWith(
			{ sub: user.id, email: user.email },
			expect.objectContaining({ expiresIn: "7d" }),
		);
	});

	it("throws when login password is invalid", async () => {
		const passwordHash = await argon2.hash("password123");

		prisma.user.findUnique.mockResolvedValue({
			id: "2a7ef42f-8a6d-4d1b-b093-37f4ff53385a",
			email: "adrian@example.com",
			displayName: "Adrian",
			status: "ACTIVE",
			createdAt: new Date("2026-06-22T17:30:00.000Z"),
			passwordHash,
		});

		await expect(
			service.login({
				email: "adrian@example.com",
				password: "wrong-password",
			}),
		).rejects.toThrow("Invalid email or password");
	});

	it("throws when login user does not exist", async () => {
		prisma.user.findUnique.mockResolvedValue(null);

		await expect(
			service.login({
				email: "missing@example.com",
				password: "password123",
			}),
		).rejects.toThrow("Invalid email or password");
	});

	it("returns the authenticated user for getMe", async () => {
		const user = {
			id: "2a7ef42f-8a6d-4d1b-b093-37f4ff53385a",
			email: "adrian@example.com",
			displayName: "Adrian",
			status: "ACTIVE",
			createdAt: new Date("2026-06-22T17:30:00.000Z"),
		};

		prisma.user.findUnique.mockResolvedValue(user);

		await expect(service.getMe(user.id)).resolves.toEqual(user);
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: user.id },
			select: {
				id: true,
				email: true,
				displayName: true,
				status: true,
				createdAt: true,
			},
		});
	});

	it("throws when the authenticated user no longer exists", async () => {
		prisma.user.findUnique.mockResolvedValue(null);

		await expect(service.getMe("missing-user-id")).rejects.toThrow("Authenticated user no longer exists");
	});
});
