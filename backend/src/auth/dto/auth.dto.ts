import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO = Data Transfer Object. Les decorateurs class-validator valident
// automatiquement le corps de la requete AVANT qu'il n'atteigne le controleur
// (le ValidationPipe global, dans main.ts, applique ces regles).

export class RegisterDto {
  @ApiProperty({ example: 'noemie@example.com' })
  @IsEmail({}, { message: 'Email : format invalide.' })
  email: string;

  @ApiProperty({ example: 'motdepasse123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Mot de passe : minimum 8 caractères.' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'noemie@example.com' })
  @IsString()
  @IsNotEmpty({ message: 'Email requis.' })
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @IsNotEmpty({ message: 'Mot de passe requis.' })
  password: string;
}
