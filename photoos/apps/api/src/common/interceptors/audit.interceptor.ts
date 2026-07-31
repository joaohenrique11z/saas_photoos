import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          this.logger.log(
            `[AUDIT] ${method} ${url} - User: ${user?.id || 'ANONYMOUS'} (${user?.papel || 'N/A'}) - IP: ${ip} - Duration: ${duration}ms`,
          );
        }
      }),
    );
  }
}
