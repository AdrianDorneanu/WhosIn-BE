import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { GamesService } from "./games.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("games")
export class GamesController {
	constructor(private readonly gamesService: GamesService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	createGame(): void {
		this.gamesService.createGame();
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getAllGames() {
		return this.gamesService.getAllGames();
	}
}
