import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MongoError } from 'mongodb';

export async function DBErrorHandler(error: MongoError): Promise<any> {
  if (error.code === 11000) {
    const messages = Object.keys(error['keyValue']).map(
      key => `${key} is already exists`,
    );

    throw new ConflictException(messages);
  } else {
    console.log(error);

    throw new InternalServerErrorException();
  }
}
