import { ApiRouteBuilder } from '@builders/next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchPackage } from '@/app/api';

export const GET = new ApiRouteBuilder()
  .setParams(z.object({ package: z.string() }))
  .setDefinition(async ({ request, params }) => {
    const pacxage = await fetchPackage(params.package);

    const path = pacxage
      ? `/packages/${params.package}/${pacxage.releases[0].version}`
      : '/packages';
    const url = new URL(path, request?.nextUrl.origin ?? process.env.APP_URL);

    return NextResponse.redirect(url);
  });
