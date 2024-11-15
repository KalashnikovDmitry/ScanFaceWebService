import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async compareFace(descriptor: number[]): Promise<User | null> {
    const users = await this.userModel.findAll();

    let closestUser: User | null = null;
    let minDistance = Infinity;

    for (const user of users) {
      if (user.faceDescriptor) {
        const distance = euclideanDistance(descriptor, user.faceDescriptor);
        if (distance < 0.6 && distance < minDistance) { // 0.6 — пороговое значение схожести
          minDistance = distance;
          closestUser = user;
        }
      }
    }

    return closestUser;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userModel.create(createUserDto);
    return user;
  }
}

// Вспомогательная функция для вычисления евклидова расстояния
function euclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  return Math.sqrt(
    descriptor1.reduce((sum, val, i) => sum + (val - descriptor2[i]) ** 2, 0)
  );
}
