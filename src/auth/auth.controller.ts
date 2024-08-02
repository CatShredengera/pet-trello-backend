import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@HttpCode(HttpStatus.OK)
	@Post('refresh-token')
	async getNewToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshTokenFromCookies = req.cookies[this.authService.REFRESH_TOKEN_NAME];

		if (!refreshTokenFromCookies) {
			this.authService.removeRefreshTokenFromResponse(res);
			throw new UnauthorizedException('Refresh token not passed');
		}

		const { refreshToken, ...response } = await this.authService.getNewTokens(refreshTokenFromCookies);

		this.authService.addRefreshTokenToResponse(res, refreshToken);

		return response;
	}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	public async login(@Body() payload: AuthDto, @Res({ passthrough: true }) res: Response) {
		const { refreshToken, ...response } = await this.authService.login(payload);

		this.authService.addRefreshTokenToResponse(res, refreshToken);

		return response;
	}

	@HttpCode(HttpStatus.CREATED)
	@Post('register')
	public async register(@Body() payload: AuthDto, @Res({ passthrough: true }) res: Response) {
		const { refreshToken, ...response } = await this.authService.register(payload);

		this.authService.addRefreshTokenToResponse(res, refreshToken);

		return response;
	}

	@HttpCode(HttpStatus.CREATED)
	@Post('logout')
	public async logout(@Res({ passthrough: true }) res: Response) {
		this.authService.removeRefreshTokenFromResponse(res);

		return true;
	}
}
