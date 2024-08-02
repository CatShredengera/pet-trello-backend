import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	public getById(id: string) {
		return this.prisma.user.findUnique({
			where: { id },
			include: { tasks: true }
		});
	}

	public getByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: { email }
		});
	}

	public async create(payload: AuthDto) {
		const user = {
			email: payload.email,
			name: '',
			password: await hash(payload.password)
		};

		return this.prisma.user.create({ data: user });
	}
}
