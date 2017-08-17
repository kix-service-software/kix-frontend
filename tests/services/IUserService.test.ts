import { UserResponse } from './../../src/model/user/UserResponse';
import { UsersResponse } from './../../src/model/user/UsersResponse';
import { User, SortOrder } from './../../src/model/';
/* tslint:disable no-var-requires no-unused-expression max-line-length */
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

    describe('should create a valid request to retrieve a user.', () => {
        before(() => {
            mock.onGet(apiURL + '/users/12345')
                .reply(200, createUserResponse());
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
        describe('Create a valid request to retrieve all users.', () => {
            before(() => {
                mock.onGet(apiURL + '/users')
                    .reply(200, createUsersResponse(4));
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

        describe('Create a valid request to retrieve a list of 5 users', () => {
            before(() => {
                mock.onGet(apiURL + '/users?Limit=5')
                    .reply(200, createUsersResponse(5));
            });

            after(() => {
                mock.reset();
            });

            it('should return a limited list of 5 users.', async () => {
                const users: User[] = await userService.getUsers(5);
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
                expect(users.length).equal(5);
            });
        });

        describe('Create a valid request to retrieve a sorted list of users.', () => {
            before(() => {
                mock.onGet(apiURL + '/users?Order=Down')
                    .reply(200, createUsersResponse(2));
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

        describe('Create a valid request to retrieve a list of users witch where changed after defined date.', () => {
            before(() => {
                mock.onGet(apiURL + '/users?ChangedAfter=20170815')
                    .reply(200, createUsersResponse(3));
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

        describe('Create a valid request to retrieve a limeted of users witch where changed after defined date.', () => {
            before(() => {
                mock.onGet(apiURL + '/users?Limit=6&ChangedAfter=20170815')
                    .reply(200, createUsersResponse(6));
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

        describe('Create a valid request to retrieve a limeted, sorted of users', () => {
            before(() => {
                mock.onGet(apiURL + '/users?Limit=6&Order=Up')
                    .reply(200, createUsersResponse(6));
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

        describe('Create a valid request to retrieve a sorted list of users witch where changed after defined date.', () => {
            before(() => {
                mock.onGet(apiURL + '/users?Order=Up&ChangedAfter=20170815')
                    .reply(200, createUsersResponse(4));
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

function createUserResponse(): UserResponse {
    const response = new UserResponse();
    response.User = new User();
    return response;
}

function createUsersResponse(userCount: number): UsersResponse {
    const response = new UsersResponse();
    for (let i = 0; i < userCount; i++) {
        response.User.push(new User());
    }
    return response;
}
