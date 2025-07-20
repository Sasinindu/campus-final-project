import { Repository } from 'typeorm';
import { User, IUser } from '../entities/User';
import { AppDataSource } from '../config/database';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public async getUserById(id: number): Promise<IUser | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user;
  }

  public async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  public async updateUser(
    id: number,
    updateData: Partial<IUser>,
  ): Promise<IUser> {
    await this.userRepository.update(id, updateData);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  }
}

export const userService = new UserService();
