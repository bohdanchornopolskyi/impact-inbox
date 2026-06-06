import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { type Database, Transaction, users } from "@repo/db";
import { eq } from "drizzle-orm";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UpdateProfileDto } from "src/users/dto/update-profile.dto";
import { getUserByEmailDto } from "src/users/dto/user-email.dto";

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}
  async getUserById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));

    if (!user) throw new NotFoundException(`User #${id} not found`);

    return user;
  }

  async findUserByEmail(
    getUserByEmailDTO: getUserByEmailDto,
    tx?: Transaction,
  ) {
    const { email } = getUserByEmailDTO;
    const [user] = await (tx ?? this.db)
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user;
  }

  async createUser(user: CreateUserDto, tx?: Transaction) {
    const [createdUser] = await (tx ?? this.db)
      .insert(users)
      .values(user)
      .returning();
    if (!createdUser) {
      throw new InternalServerErrorException("User creation failed.");
    }
    return createdUser;
  }

  async updateUser(userId: string, dto: UpdateProfileDto, tx?: Transaction) {
    if (dto.email) {
      const [existing] = await (tx ?? this.db)
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, dto.email));

      if (existing && existing.id !== userId) {
        throw new ConflictException("Email already in use");
      }
    }

    const updates: {
      name?: string;
      email?: string;
      emailVerifiedAt?: Date | null;
    } = {};

    if (dto.name !== undefined) {
      updates.name = dto.name;
    }

    if (dto.email !== undefined) {
      updates.email = dto.email;
      updates.emailVerifiedAt = null;
    }

    const [updatedUser] = await (tx ?? this.db)
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return updatedUser;
  }

  async verifyEmail(userId: string, tx?: Transaction) {
    const [updatedUser] = await (tx ?? this.db)
      .update(users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return updatedUser;
  }

  async deleteUser(userId: string, tx?: Transaction) {
    const [deletedUser] = await (tx ?? this.db)
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!deletedUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return deletedUser;
  }
}
