import prisma from '../database/connection.js';

class User {
  static async create(userData) {
    return await prisma.user.create({
      data: userData,
    });
  }

  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  static async exists(email, username) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });
  }
}

export default User; 