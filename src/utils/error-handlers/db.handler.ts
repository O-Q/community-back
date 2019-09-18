import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MongoError } from 'mongodb';

export async function DBErrorHandler(error: MongoError): Promise<any> {
  if (error.code === 11000) {
    throw new ConflictException('already exists');
  } else {
    console.log(error);

    throw new InternalServerErrorException();
  }
}
