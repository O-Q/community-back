import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor() { }
  getUsers() {
    // this.userModel.updateOne({}, { $set: {} });
  }
  deleteUser() { }
}
