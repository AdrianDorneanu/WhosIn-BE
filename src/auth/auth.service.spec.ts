import { Test, TestingModule } from "@nestjs/testing";
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

describe("AuthService", () => {
	let service: AuthService;
	let prisma: {
		user: {
			findUnique: jest.Mock;
			create: jest.Mock<Promise<SignupResponse>, [CreateUserArgs]>;
		};
	};

	beforeEach(async () => {
		prisma = {
			user: {
				findUnique: jest.fn(),
				create: jest.fn<Promise<SignupResponse>, [CreateUserArgs]>(),
			},
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: PrismaService,
					useValue: prisma,
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
});
