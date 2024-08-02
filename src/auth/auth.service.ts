import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';
import { verify } from 'argon2';
import { Response } from 'express';

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 1;
	REFRESH_TOKEN_NAME = 'refreshToken';

	constructor(
		private readonly jwt: JwtService,
		private readonly userService: UserService
	) {}

	public async login(payload: AuthDto) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.validateUser(payload);

		const tokens = this.issueTokens(user.id);

		return {
			user,
			...tokens
		};
	}

	public async register(payload: AuthDto) {
		const existedUser = await this.userService.getByEmail(payload.email);

		if (existedUser) throw new BadRequestException('User already exists');

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.userService.create(payload);

		const tokens = this.issueTokens(user.id);

		return {
			user,
			...tokens
		};
	}

	public async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken);

		if (!result) throw new UnauthorizedException('Invalid refresh token');

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.userService.getById(result.id);

		const tokens = this.issueTokens(user.id);

		return {
			user,
			...tokens
		};
	}

	public addRefreshTokenToResponse(response: Response, refreshToken: string) {
		const expiresIn = new Date();

		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

		response.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: 'localhost',
			expires: expiresIn,
			secure: true,
			sameSite: 'none'
		});
	}

	public removeRefreshTokenFromResponse(response: Response) {
		response.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: 'localhost',
			expires: new Date(0),
			secure: true,
			sameSite: 'none'
		});
	}

	private issueTokens(userId: string) {
		const data = { id: userId };

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		});

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		});

		return { accessToken, refreshToken };
	}

	private async validateUser(payload: AuthDto) {
		const user = await this.userService.getByEmail(payload.email);

		if (!user) throw new NotFoundException('User not found');

		const isValid = await verify(user.password, payload.password);

		if (!isValid) throw new NotFoundException('Invalid password');

		return user;
	}
}
