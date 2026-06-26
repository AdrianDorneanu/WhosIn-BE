import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
	let controller: AuthController;
	let authService: {
		signUp: jest.Mock;
		login: jest.Mock;
		getMe: jest.Mock;
	};

	beforeEach(async () => {
		authService = {
			signUp: jest.fn(),
			login: jest.fn(),
			getMe: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: authService,
				},
				{
					provide: JwtService,
					useValue: {
						verifyAsync: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("returns the current user", async () => {
		const user = {
			id: "2a7ef42f-8a6d-4d1b-b093-37f4ff53385a",
			email: "adrian@example.com",
			displayName: "Adrian",
			status: "ACTIVE",
			createdAt: new Date("2026-06-22T17:30:00.000Z"),
		};

		authService.getMe.mockResolvedValue(user);

		await expect(
			controller.getMe({
				sub: user.id,
				email: user.email,
			}),
		).resolves.toEqual(user);
		expect(authService.getMe).toHaveBeenCalledWith(user.id);
	});
});
