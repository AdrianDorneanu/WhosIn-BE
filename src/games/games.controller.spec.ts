import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { GamesController } from "./games.controller";
import { GamesService } from "./games.service";

describe("GamesController", () => {
  let controller: GamesController;

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: {
            createGame: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
  });

it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
