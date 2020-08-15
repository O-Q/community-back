// import { Test, TestingModule } from '@nestjs/testing';
// import * as request from 'supertest';
// import * as mongoose from 'mongoose';
// import { AppModule } from './../src/app.module';
// import { INestApplication } from '@nestjs/common';
// import { FastifyAdapter } from '@nestjs/platform-fastify';
// mongoose.set('useCreateIndex', true);

// describe('AppController (e2e)', () => {
//   let app: INestApplication;

//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//     app = moduleFixture.createNestApplication(new FastifyAdapter());
//     await app.init();
//   });

//   it('/ (GET)', () => {
//     return request(app.getHttpServer())
//       .get('/forum/widget/default')
//       .expect(200)
//       .expect('Hello World!');
//   });
//   afterAll(async () => {
//     await app.close();
//   });
// });
