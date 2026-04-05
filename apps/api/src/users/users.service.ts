import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { type Database, Transaction, users } from "@repo/db";
import { eq } from "drizzle-orm";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { getUserByEmailDto } from "src/users/dto/user-email.dto";

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}
  async getUserById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));

    if (!user) throw new NotFoundException(`User #${id} not found`);

    return user;
  }

  async getUserByEmail(getUserByEmailDTO: getUserByEmailDto, tx?: Transaction) {
    const { email } = getUserByEmailDTO;
    const [user] = await (tx ?? this.db)
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) throw new UnauthorizedException("Invalid email or password");

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
}
