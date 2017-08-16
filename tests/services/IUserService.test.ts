import { User, SortOrder } from './../../src/model/';
/* tslint:disable no-var-requires no-unused-expression */
import { container } from './../../src/Container';
import { IConfigurationService, IUserService } from './../../src/services/';
import chaiAsPromised = require('chai-as-promised');
import MockAdapter = require('axios-mock-adapter');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const userService: IUserService = container.get<IUserService>("IUserService");
const configurationService: IConfigurationService = container.get<IConfigurationService>("IConfigurationService");

const axios = require('axios');

const apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;

describe('User Service', () => {
    let mock;

    before(() => {
        mock = new MockAdapter(axios);
    });

    after(() => {
        mock.restore();
    });

    it('service instance is registered in container.', () => {
        expect(userService).not.undefined;
    });

    describe('Get a user', () => {
        before(() => {
            mock.onGet(apiURL + '/users/12345')
                .reply(200, new User());
        });

        after(() => {
            mock.reset();
        });

        it('should return a user object.', async () => {
            const user: User = await userService.getUser(12345);
            expect(user).not.undefined;
        });
    });

    describe('Get multiple users', () => {
        describe('Get all users', () => {
            before(() => {
                mock.onGet(apiURL + '/users')
                    .reply(200, {
                        UserID: [1, 2, 3, 4]
                    });
            });

            after(() => {
                mock.reset();
            });

            it('should return a list of users.', async () => {
                const users: User[] = await userService.getUsers();
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });

        });

        describe('Get a list of 5 users', () => {
            before(() => {
                mock.onGet(apiURL + '/users?Limit=5')
                    .reply(200, {
                        UserID: [1, 2, 3, 4, 5]
                    });
            });

            after(() => {
                mock.reset();
            });

            it('should return a limited list of users.', async () => {
                const users: User[] = await userService.getUsers(5);
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
                expect(users.length).equal(5);
            });
        });

        describe('Get a sorted list of users.', () => {
            before(() => {
                mock.onGet(apiURL + '/users?Order=Down')
                    .reply(200, {
                        UserID: [5, 4, 3, 2, 1]
                    });
            });

            after(() => {
                mock.reset();
            });

            it('should return a sorted list of users.', async () => {
                const users: User[] = await userService.getUsers(null, SortOrder.DOWN);
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });
        });

        describe('Get a of users witch where changed after defined date.', () => {
            before(() => {
                mock.onGet(apiURL + '/users?ChangedAfter=20170815')
                    .reply(200, {
                        UserID: [5, 4, 3, 2, 1]
                    });
            });

            after(() => {
                mock.reset();
            });

            it('should return a list of users filtered by changed after.', async () => {
                const users: User[] = await userService.getUsers(null, null, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });
        });

        describe('Get a limeted of users witch where changed after defined date.', () => {
            before(() => {
                mock.onGet(apiURL + '/users?Limit=5&ChangedAfter=20170815')
                    .reply(200, {
                        UserID: [6, 5, 4, 3, 2, 1]
                    });
            });

            after(() => {
                mock.reset();
            });

            it('should return a limited list of users filtered by changed after.', async () => {
                const users: User[] = await userService.getUsers(6, null, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users.length).equal(6);
                expect(users).not.empty;
            });
        });

        describe('Get a limeted, sorted of users', () => {
            before(() => {
                mock.onGet(apiURL + '/users?Limit=5&Order=Up')
                    .reply(200, {
                        UserID: [6, 5, 4, 3, 2, 1]
                    });
            });

            after(() => {
                mock.reset();
            });

            it('should return a limited, sorted list of users.', async () => {
                const users: User[] = await userService.getUsers(6, SortOrder.UP);
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users.length).equal(6);
                expect(users).not.empty;
            });
        });

        describe('Get a sorted of users witch where changed after defined date.', () => {
            before(() => {
                mock.onGet(apiURL + '/users?Order=Up&ChangedAfter=20170815')
                    .reply(200, {
                        UserID: [6, 5, 4, 3, 2, 1]
                    });
            });

            after(() => {
                mock.reset();
            });
            it('should return a sorted list of users filtered by changed after.', async () => {
                const users: User[] = await userService.getUsers(null, SortOrder.UP, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });
        });
    });
});
