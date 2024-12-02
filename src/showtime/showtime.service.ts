import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Showtime, ShowtimeDocument } from './schema/showtime.schema';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class ShowtimeService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Showtime.name) private showtimeModel: Model<ShowtimeDocument>,
    private configService: ConfigService,
  ) {
    const stripeApiKey = this.configService.get<string>('STRIPE_API_KEY');
    console.log('STRIPE_API_KEY:', stripeApiKey); // For debugging
    
    if (!stripeApiKey) {
      throw new Error('STRIPE_API_KEY is not defined in environment variables');
    }

    this.stripe = new Stripe(stripeApiKey, {
      apiVersion: '2024-11-20.acacia' as const,
    });
  }

  async create(createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
    const showtime = new this.showtimeModel({
      ...createShowtimeDto,
      availableTickets: createShowtimeDto.totalTickets,
    });
    return showtime.save();
  }

  async purchaseTickets(
    showtimeId: string,
    purchaseTicketDto: PurchaseTicketDto,
  ): Promise<{ clientSecret: string; showtime: Showtime }> {
    const showtime = await this.showtimeModel.findById(showtimeId);
    
    if (!showtime) {
      throw new NotFoundException('Showtime not found');
    }

    if (showtime.availableTickets < purchaseTicketDto.numberOfTickets) {
      throw new BadRequestException('Not enough tickets available');
    }

    // Calculate total amount in cents (Stripe requires amounts in cents)
    const totalAmount = Math.round(showtime.ticketPrice * purchaseTicketDto.numberOfTickets * 100);

    try {
      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'usd',
        metadata: {
          showtimeId: showtimeId,
          numberOfTickets: purchaseTicketDto.numberOfTickets,
        },
      });

      // Update available tickets
      showtime.availableTickets -= purchaseTicketDto.numberOfTickets;
      await showtime.save();

      // Return the client secret and showtime details
      return {
        clientSecret: paymentIntent.client_secret,
        showtime: showtime,
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new BadRequestException('Payment initialization failed');
    }
  }

  async findAll(): Promise<Showtime[]> {
    return this.showtimeModel.find().exec();
  }

  async findOne(id: string): Promise<Showtime> {
    const showtime = await this.showtimeModel.findById(id);
    if (!showtime) {
      throw new NotFoundException('Showtime not found');
    }
    return showtime;
  }

  async findAvailable(): Promise<Showtime[]> {
    return this.showtimeModel.find({
      availableTickets: { $gt: 0 },
      startTime: { $gt: new Date() }
    }).sort({ startTime: 1 }).exec();
  }

  async confirmPurchase(
    showtimeId: string,
    purchaseTicketDto: PurchaseTicketDto,
  ): Promise<Showtime> {
    const showtime = await this.showtimeModel.findById(showtimeId);
    
    if (!showtime) {
      throw new NotFoundException('Showtime not found');
    }

    if (showtime.availableTickets < purchaseTicketDto.numberOfTickets) {
      throw new BadRequestException('Not enough tickets available');
    }

    showtime.availableTickets -= purchaseTicketDto.numberOfTickets;
    return showtime.save();
  }
}