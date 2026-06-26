import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import type { AuthenticatedRequest } from "../types/authenticated-request.type";
import type { JwtPayload } from "../types/jwt-payload.type";

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException("Missing access token");
		}

		try {
			request.user = await this.jwtService.verifyAsync<JwtPayload>(token, {
				secret: process.env.JWT_ACCESS_SECRET,
			});
		} catch {
			throw new UnauthorizedException("Invalid or expired access token");
		}

		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(" ") ?? [];

		return type === "Bearer" ? token : undefined;
	}
}
