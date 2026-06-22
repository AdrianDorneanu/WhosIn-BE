import { ApiProperty } from "@nestjs/swagger";

export class SignupResponseDto {
	@ApiProperty({ example: "2a7ef42f-8a6d-4d1b-b093-37f4ff53385a" })
	id!: string;

	@ApiProperty({ example: "adrian@example.com" })
	email!: string;

	@ApiProperty({ example: "Adrian" })
	displayName!: string;

	@ApiProperty({ example: "ACTIVE" })
	status!: string;

	@ApiProperty({ example: "2026-06-22T17:30:00.000Z" })
	createdAt!: Date;
}
