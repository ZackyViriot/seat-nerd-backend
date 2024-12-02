import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';

@Controller('showtimes')
export class ShowtimeController {
    constructor(private readonly showtimeService: ShowtimeService) {}

    @Post()
    create(@Body() createShowtimeDto: CreateShowtimeDto) {
        return this.showtimeService.create(createShowtimeDto);
    }


    @Get()
    findAll() {
        return this.showtimeService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.showtimeService.findOne(id);
    }

    @Post(':id/purchase')
    purchaseTickets(
        @Param('id') id: string,
        @Body() purchaseTicketDto: PurchaseTicketDto,
    ) {
        return this.showtimeService.purchaseTickets(id, purchaseTicketDto);
    }

    @Post(':id/confirm')
    async confirmPurchase(
        @Param('id') id: string,
        @Body() purchaseTicketDto: PurchaseTicketDto,
    ) {
        try {
            return await this.showtimeService.confirmPurchase(id, purchaseTicketDto);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error('Failed to confirm purchase');
        }
    }
}