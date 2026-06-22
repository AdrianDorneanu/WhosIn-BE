import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
	@ApiProperty({ description: "The access token for the authenticated user" })
	accessToken!: string;
	@ApiProperty({ description: "The refresh token for the authenticated user" })
	refreshToken!: string;
}
