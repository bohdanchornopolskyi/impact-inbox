import { Injectable, NotFoundException } from "@nestjs/common";
import { db, users } from "@repo/db";
import { eq } from "drizzle-orm";
import { CreateUserDto } from "src/users/dto/create-user.dto";

@Injectable()
export class UsersService {
  async getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) throw new NotFoundException(`User #${id} not found`);

    return user;
  }

  async createUser(user: CreateUserDto) {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }
}
