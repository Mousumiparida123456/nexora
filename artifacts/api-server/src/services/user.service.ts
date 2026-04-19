import { ApiError } from "../lib/api-error";
import { cache } from "../lib/cache";
import { userRepository, type UserRole } from "../repositories/user.repository";

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  },

  async listUsers(input: { page: number; limit: number; role?: UserRole; search?: string }) {
    const cacheKey = `users:${input.page}:${input.limit}:${input.role ?? "all"}:${input.search ?? "none"}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as unknown;
    }

    const offset = (input.page - 1) * input.limit;
    const result = await userRepository.listUsers({
      limit: input.limit,
      offset,
      role: input.role,
      search: input.search,
    });

    const payload = {
      items: result.items,
      pagination: {
        page: input.page,
        limit: input.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / input.limit),
      },
    };

    await cache.set(cacheKey, JSON.stringify(payload), 60);
    return payload;
  },
};
