import { IsNotEmpty, IsString, IsNumber, Min, Max, IsUrl } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;
}