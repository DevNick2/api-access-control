import { Body, Controller, HttpCode, HttpStatus, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Public } from "src/shared/decorators/public.decorator";
import { Roles } from "src/shared/decorators/roles.decorator";
import { UserStoreDTO } from "../dto/user.dto";
import { UserResources } from "../resources/user.resource";
import { UserService } from "../services/user.service";
import { RolesGuard } from "src/shared/guard/roles.guard";

@ApiTags('User')
@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(
    @Inject() private userService: UserService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles({ profile: ['admin'] })
  @Post()
  async createManager(@Body() payload: UserStoreDTO): Promise<UserResources> {
    const user = await this.userService.store(payload);

    return new UserResources(user);
  }
}