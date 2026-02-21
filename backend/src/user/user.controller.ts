import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@Req() req) {
    return this.userService.findById(req.user.userId);
  }

  @Patch()
  setHomeNode(@Req() req, @Body('nodeId') nodeId: string) {
    return this.userService.setHomeNode(req.user.userId, nodeId);
  }

}
