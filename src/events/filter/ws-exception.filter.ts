import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ClientEvent } from '../../shared/socket-events.enum';

/**
 * Transform Http Exception(Bad Request from class-validator) to Ws Exception
 */
@Catch(HttpException)
export class WsExceptionsFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const socket: Socket = host.getArgByIndex(0);
        socket.emit(ClientEvent.EXCEPTION, {
            status: 'error',
            message: exception.response?.message,
        });
    }
}
