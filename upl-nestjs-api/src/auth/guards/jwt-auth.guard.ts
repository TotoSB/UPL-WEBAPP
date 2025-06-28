import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { // 'jwt' se refiere al nombre de la estrategia
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Aquí se pueden añadir lógicas personalizadas antes de invocar la estrategia JWT
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    // Aquí se puede personalizar el manejo de errores o la respuesta
    // Por ejemplo, si info es JwtExpiredError, se puede lanzar una excepción específica
    if (err || !user) {
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Your token has expired. Please log in again.');
      }
      throw err || new UnauthorizedException('You are not authorized to access this resource.');
    }
    return user; // Devuelve el objeto user si la autenticación es exitosa
  }
}
