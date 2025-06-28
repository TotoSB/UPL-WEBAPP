import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service'; // Para validar el usuario desde la BD
import { UserEntity } from '../../users/entities/user.entity';

export interface JwtPayload {
  username: string;
  sub: string; // ID del usuario
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService, // Inyectar AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Asegurarse que los tokens expirados sean rechazados
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<Omit<UserEntity, 'password_hash'>> {
    // Lo que se devuelve aquí se adjunta a `req.user` en las rutas protegidas
    // Validar si el usuario aún existe y está activo, etc.
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or not active.');
    }
    // No es necesario devolver la contraseña u otros datos sensibles aquí
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = user;
    return result as UserEntity;
  }
}
