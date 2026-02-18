import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@second-brain/database';
import { getUser } from '@/lib/auth-helpers';

// Mock dependencies
vi.mock('@/lib/auth-helpers', () => ({
  getUser: vi.fn(),
}));

vi.mock('@second-brain/database', () => ({
  prisma: {
    inboxItem: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('POST /api/inbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Arrange: Mock getUser to return null (unauthenticated)
    vi.mocked(getUser).mockResolvedValue(null);

    const request = new Request('http://localhost/api/inbox', {
      method: 'POST',
      body: JSON.stringify({ content: 'Test content' }),
    });

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(401);
    expect(prisma.inboxItem.create).not.toHaveBeenCalled();
  });

  it('should create item if user is authenticated', async () => {
    // Arrange: Mock getUser to return a user
    const mockUser = { id: 'user-123' };
    vi.mocked(getUser).mockResolvedValue(mockUser as any);

    const mockItem = { id: 'item-1', content: 'Test content', userId: 'user-123' };
    vi.mocked(prisma.inboxItem.create).mockResolvedValue(mockItem as any);

    const request = new Request('http://localhost/api/inbox', {
      method: 'POST',
      body: JSON.stringify({ content: 'Test content' }),
    });

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(200);
    expect(prisma.inboxItem.create).toHaveBeenCalledWith({
      data: {
        content: 'Test content',
        source: 'api',
        userId: 'user-123',
      },
    });
  });
});
