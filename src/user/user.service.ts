import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './dto/user.dto';
import { startOfDay, subDays } from 'date-fns';

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

	public async getProfile(id: string) {
		const profile = await this.getById(id);

		const totalTasks = profile.tasks.length;
		const completedTasks = await this.prisma.task.count({
			where: { userId: id, isCompleted: true }
		});

		const todayStart = startOfDay(new Date());
		const weekStart = startOfDay(subDays(new Date(), 7));

		const todayTasks = await this.prisma.task.count({
			where: {
				userId: id,
				createdAt: { gte: todayStart.toISOString() }
			}
		});

		const weekTasks = await this.prisma.task.count({
			where: {
				userId: id,
				createdAt: { gte: weekStart.toISOString() }
			}
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...rest } = profile;

		return {
			user: rest,
			statistics: [
				{ label: 'Total', value: totalTasks },
				{ label: 'Completed tasks', value: completedTasks },
				{ label: 'Today tasks', value: todayTasks },
				{ label: 'Week tasks', value: weekTasks }
			]
		};
	}

	public async create(payload: AuthDto) {
		const user = {
			email: payload.email,
			name: '',
			password: await hash(payload.password)
		};

		return this.prisma.user.create({ data: user });
	}

	public async update(id: string, payload: UserDto) {
		let data = payload;

		if (data.password) {
			data = { ...payload, password: await hash(payload.password) };
		}

		return this.prisma.user.update({ where: { id: id }, data, select: { name: true, email: true } });
	}
}
