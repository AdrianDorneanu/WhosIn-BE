import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "./jwt-auth.guard";

type TestRequest = {
	headers: {
		authorization?: string;
	};
	user?: {
		sub: string;
		email: string;
	};
};

const createContext = (request: TestRequest): ExecutionContext =>
	({
		getHandler: jest.fn(),
		getClass: jest.fn(),
		switchToHttp: () => ({
			getRequest: () => request,
		}),
	}) as unknown as ExecutionContext;

describe("JwtAuthGuard", () => {
	let jwtService: {
		verifyAsync: jest.Mock;
	};
	let guard: JwtAuthGuard;

	beforeEach(() => {
		jwtService = {
			verifyAsync: jest.fn(),
		};
		guard = new JwtAuthGuard(jwtService as unknown as JwtService);
	});

	it("throws when the access token is missing", async () => {
		await expect(guard.canActivate(createContext({ headers: {} }))).rejects.toThrow(UnauthorizedException);
	});

	it("attaches the JWT payload to the request when the access token is valid", async () => {
		const request: TestRequest = {
			headers: { authorization: "Bearer valid-token" },
		};
		const payload = {
			sub: "2a7ef42f-8a6d-4d1b-b093-37f4ff53385a",
			email: "adrian@example.com",
		};

		jwtService.verifyAsync.mockResolvedValue(payload);

		await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
		expect(jwtService.verifyAsync).toHaveBeenCalledWith("valid-token", {
			secret: process.env.JWT_ACCESS_SECRET,
		});
		expect(request.user).toEqual(payload);
	});

	it("throws when the access token is invalid", async () => {
		jwtService.verifyAsync.mockRejectedValue(new Error("invalid token"));

		await expect(
			guard.canActivate(createContext({ headers: { authorization: "Bearer invalid-token" } })),
		).rejects.toThrow("Invalid or expired access token");
	});
});
