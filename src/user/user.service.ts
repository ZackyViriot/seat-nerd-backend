import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    
    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate password strength
    this.validatePassword(password);

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    
    return user.save();
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private validatePassword(password: string) {
    if (password.length < 8) {
      throw new ConflictException('Password must be at least 8 characters long');
    }
    if (!/\d/.test(password)) {
      throw new ConflictException('Password must contain at least one number');
    }
    if (!/[A-Z]/.test(password)) {
      throw new ConflictException('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new ConflictException('Password must contain at least one lowercase letter');
    }
  }
}