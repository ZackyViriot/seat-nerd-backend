import { IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateShowtimeDto {
  @IsNotEmpty()
  movieId: string;

  @IsDateString()
  startTime: string;

  @IsNumber()
  @Min(1)
  totalTickets: number;

  @IsNumber()
  @Min(0)
  ticketPrice: number;
}