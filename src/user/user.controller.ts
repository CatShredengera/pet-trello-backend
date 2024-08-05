import { Body, Controller, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthUser } from 'src/auth/decorators/user.decorators';
import { UserDto } from './dto/user.dto';

@Auth()
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('/current-user/profile')
	async getProfile(@AuthUser('id') id: string) {
		return this.userService.getProfile(id);
	}

	@HttpCode(HttpStatus.OK)
	@Put('/current-user')
	async updateProfile(@AuthUser('id') id: string, @Body() payload: UserDto) {
		return this.userService.update(id, payload);
	}
}
