import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthenticatedRequest } from "../types/authenticated-request.type";
import type { JwtPayload } from "../types/jwt-payload.type";

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): JwtPayload => {
	const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

	return request.user as JwtPayload;
});
