import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShowtimeDocument = Showtime & Document;

@Schema()
export class Showtime {
  @Prop({ required: true })
  movieId: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  totalTickets: number;

  @Prop({ required: true })
  availableTickets: number;

  @Prop({ required: true })
  ticketPrice: number;
}

export const ShowtimeSchema = SchemaFactory.createForClass(Showtime);