import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GamesService {
	constructor(private readonly prisma: PrismaService) {}

	createGame(): void {
		console.log("Creating a new game...");
	}

	async getAllGames() {
		return this.prisma.game.findMany();
	}
}
