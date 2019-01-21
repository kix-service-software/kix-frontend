// // tslint:disable

// import express = require('express');

// import chaiAsPromised = require('chai-as-promised');
// import chai = require('chai');

// import http = require('http');
// import { ConfigurationService, ProfilingService } from '../../src/core/services';
// import { SocketCommunicationService, PluginService } from '../../src/services';
// import { UserType, AuthenticationEvent, AuthenticationResult, LoginRequest, Error } from '../../src/core/model';

// chai.use(chaiAsPromised);
// const expect = chai.expect;

// describe('Authentication Communicator', () => {
//     let nockScope;
//     let configurationService: ConfigurationService;
//     let socketService: SocketCommunicationService;
//     let apiURL: string;
//     let socketIO;
//     let socketUrl;

//     before(async () => {
//         PluginService.getInstance();

//         const nock = require('nock');
//         configurationService = ConfigurationService.getInstance();
//         configurationService.init('../../../../config/', '../../ cert/');
//         socketService = SocketCommunicationService.getInstance();

//         ProfilingService.getInstance();

//         const app: express.Application = express();

//         const server = http.createServer(app);
//         await socketService.initialize(server);

//         const port = configurationService.getServerConfiguration().HTTP_PORT;
//         server.listen(port);

//         apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
//         nockScope = nock(apiURL);

//         const config = configurationService.getServerConfiguration();
//         socketUrl = "http://localhost:" + config.HTTP_PORT + '/authentication';
//         socketIO = require('socket.io-client');
//     });

//     after(() => {
//         socketService.stopServer();
//     });

//     describe('Emit a valid login event', () => {
//         let socket;

//         before(() => {
//             nockScope
//                 .post('/sessions', {
//                     UserLogin: 'agent',
//                     Password: 'agent',
//                     UserType: UserType.AGENT
//                 })
//                 .reply(200, { Token: 'ABCDEFG12345' });
//             socket = socketIO.connect(socketUrl);
//         });

//         after(() => {
//             socket.close();
//         });

//         it('Should retrieve a authorized event', async (done) => {
//             socket.emit(AuthenticationEvent.LOGIN, new LoginRequest('agent', 'agent', UserType.AGENT));

//             socket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
//                 expect(result).not.undefined;
//                 expect(result).instanceof(AuthenticationResult);
//                 expect(result.token).equals('ABCDEFG12345');
//                 done();
//             });

//             socket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
//                 expect(true, 'Should not throw an unauthorized event!').false;
//             });

//             socket.on('connect_error', (error) => {
//                 expect(true, 'Could not connect to Server!').false;
//             });

//             socket.on('connect_timeout', () => {
//                 expect(true, 'Connection Timeout!').false;
//             });

//         });
//     });

//     // describe('Emit an invalid login event', () => {
//     //     let socket;

//     //     before(() => {
//     //         nockScope
//     //             .post('/sessions', {
//     //                 UserLogin: 'agent',
//     //                 Password: 'agent',
//     //                 UserType: UserType.AGENT
//     //             })
//     //             .reply(400);
//     //         socket = socketIO.connect(socketUrl);
//     //     });

//     //     after(() => {
//     //         socket.close();
//     //     });

//     //     it('Should retrieve a unauthorized event', async (done) => {
//     //         socket.on('connect', () => {
//     //             socket.emit(AuthenticationEvent.LOGIN, new LoginRequest('agent', 'agent', UserType.AGENT));

//     //             socket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
//     //                 expect(true, 'Should not throw an authorized event!').false;
//     //             });

//     //             socket.on(AuthenticationEvent.UNAUTHORIZED, (error: Error) => {
//     //                 expect(error).not.undefined;
//     //                 expect(error).instanceof(Error);
//     //                 done();
//     //             });
//     //         });

//     //         socket.on('connect_error', (error) => {
//     //             expect(true, 'Could not connect to Server!').false;
//     //         });

//     //         socket.on('connect_timeout', () => {
//     //             expect(true, 'Connection Timeout!').false;
//     //         });

//     //     });
//     // });
// });
