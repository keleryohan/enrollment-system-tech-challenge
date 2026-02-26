import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request & { requestId?: string }, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    const start = Date.now();

    res.on('finish', () => {
      const tenantId = req.header('x-tenant-id') ?? null;
      const userId = (req as any).user?.id ?? null;

      this.logger.log(
        JSON.stringify({
          msg: 'request',
          requestId,
          tenantId,
          userId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - start,
        }),
      );
    });

    next();
  }
}