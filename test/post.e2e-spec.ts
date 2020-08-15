// import * as request from 'supertest';
// import { Test } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import { FastifyAdapter } from '@nestjs/platform-fastify';
// import { AppModule } from '../src/app.module';
// import * as mongoose from 'mongoose';
// mongoose.set('useCreateIndex', true);
// describe('Post', () => {
//     function mockModel(dto: any) {
//         this.data = dto;
//         this.save = () => {
//             return this.data;
//         };
//     }
//     let app: INestApplication;
//     let server;
//     beforeEach(async () => {
//         const moduleRef = await Test.createTestingModule({
//             imports: [
//                 AppModule,
//             ],
//         })
//             // .overrideGuard(AuthGuard()).useValue({ canActivate: () => true })
//             // .overrideProvider(PostService).useValue(postService)
//             // .overrideProvider(getModelToken('Post')).useValue(mockModel)
//             // .overrideProvider(getModelToken('Social')).useValue(mockModel)
//             // .overrideProvider(getModelToken('User')).useValue(mockModel)
//             .compile();

//         app = moduleRef.createNestApplication(new FastifyAdapter());
//         server = app.getHttpServer();
//         await app.init();
//     });

//     it(`/GET posts when social exist`, () => {
//         // const result = {
//         //     data: {
//         //         name: 'Jane Doe',
//         //         grades: [3.7, 3.8, 3.9, 4.0, 3.6],
//         //     },
//         //     status: 200,
//         //     statusText: 'OK',
//         //     headers: {},
//         //     config: {},
//         // };
//         // jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));
//         return request(app.getHttpServer())
//             .get(`/post/social?n=${encodeURI('یه انجمن باحال و خوب')}&page=1&itemsPerPage=10`)
//             .expect(200);
//         // .expect((res) => console.log(res.body));
//     });
//     // it(`/GET posts when social does not exist`, () => {
//     //     return request(app.getHttpServer())
//     //         .get('/post/social')
//     //         .expect(404)
//     //         .expect(
//     //             postService.getPostsBySocialName('not exist', undefined),
//     //         );
//     // });

//     afterAll(async () => {
//         await app.close();
//     });
// });
