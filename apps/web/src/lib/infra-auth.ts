import { prisma } from '@second-brain/database';

export async function validateInfraKey(request: Request) {
  const apiKey = request.headers.get('x-infra-api-key');
  if (!apiKey) return null;

  const settings = await prisma.userSettings.findUnique({
    where: { infraApiKey: apiKey },
    include: { user: true }
  });

  if (!settings || !settings.user) return null;

  return settings.user;
}
