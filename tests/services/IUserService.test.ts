import { HttpError } from './../../src/model/http/HttpError';
import {
    User,
    SortOrder,
    UsersResponse,
    UserResponse,
    CreateUserResponse,
    CreateUserRequest,
    UserLogin,
    UserServiceError,
    UpdateUserRequest,
    UpdateUserResponse
} from './../../src/model/';
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

    describe('Create a valid request to retrieve a user.', () => {
        before(() => {
            mock.onGet(apiURL + '/users/12345')
                .reply(200, buildUserResponse());
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
                    .reply(200, buildUsersResponse(4));
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
                mock.onGet(apiURL + '/users', { params: { Limit: 5 } })
                    .reply(200, buildUsersResponse(5));
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
                mock.onGet(apiURL + '/users', { params: { Order: 'Down' } })
                    .reply(200, buildUsersResponse(2));
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
                mock.onGet(apiURL + '/users', { params: { ChangedAfter: '20170815' } })
                    .reply(200, buildUsersResponse(3));
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
                mock.onGet(apiURL + '/users', { params: { Limit: 6, ChangedAfter: '20170815' } })
                    .reply(200, buildUsersResponse(6));
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
                mock.onGet(apiURL + '/users', { params: { Limit: 6, Order: 'Up' } })
                    .reply(200, buildUsersResponse(6));
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
                mock.onGet(apiURL + '/users', { params: { Order: 'Up', ChangedAfter: '20170815' } })
                    .reply(200, buildUsersResponse(4));
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

    describe('Create User', () => {
        describe('Create a valid request to create a new user.', () => {

            before(() => {
                mock.onPost(apiURL + '/users', new CreateUserRequest('login', 'firstName', 'lastName', 'email', 'password', 'phone', 'title'))
                    .reply(200, buildCreateUserResponse(123456));
            });

            after(() => {
                mock.reset();
            });

            it('should return a the id of the new users.', async () => {
                const userId = await userService.createUser('login', 'firstName', 'lastName', 'email', 'password', 'phone', 'title');
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {
            before(() => {
                mock.onPost(apiURL + '/users', new CreateUserRequest('', 'firstName', 'lastName', 'email', 'password', 'phone', 'title'))
                    .reply(400, {});
            });

            after(() => {
                mock.reset();
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await userService.createUser('', 'firstName', 'lastName', 'email', 'password', 'phone', 'title')
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update User', () => {
        describe('Create a valid request to update an existing user.', () => {

            before(() => {
                mock.onPatch(apiURL + '/users/123456',
                    new UpdateUserRequest('login', 'firstName', 'lastName', 'email', 'password', 'phone', 'title', 1))
                    .reply(200, buildUpdateUserResponse(123456));
            });

            after(() => {
                mock.reset();
            });

            it('should return a the id of the new users.', async () => {
                const userId = await userService.updateUser(123456, 'login', 'firstName', 'lastName', 'email', 'password', 'phone', 'title', 1);
                expect(userId).equal(123456);
            });

        });

        describe('Create a valid request to partial update an existing user.', () => {

            before(() => {
                mock.onPatch(apiURL + '/users/123456',
                    {
                        User: {
                            UserFirstname: 'firstName',
                            UserLastname: 'lastName'
                        }
                    })
                    .reply(200, buildUpdateUserResponse(123456));
            });

            after(() => {
                mock.reset();
            });

            it('should return a the id of the new users.', async () => {
                const userId = await userService.updateUser(123456, null, 'firstName', 'lastName', null, null, null, null, null);
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing user.', () => {
            before(() => {
                mock.onPatch(apiURL + '/users/123456',
                    new UpdateUserRequest('', 'firstName', 'lastName', 'email', 'password', 'phone', 'title', 1))
                    .reply(400, {});
            });

            after(() => {
                mock.reset();
            });

            it('should return a the id of the new users.', async () => {
                const userId = await userService.updateUser(123456, '', 'firstName', 'lastName', 'email', 'password', 'phone', 'title', 1)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });
});

function buildUserResponse(): UserResponse {
    const response = new UserResponse();
    response.User = new User();
    return response;
}

function buildUsersResponse(userCount: number): UsersResponse {
    const response = new UsersResponse();
    for (let i = 0; i < userCount; i++) {
        response.User.push(new User());
    }
    return response;
}

function buildCreateUserResponse(id: number): CreateUserResponse {
    const response = new CreateUserResponse();
    response.UserID = id;
    return response;
}

function buildUpdateUserResponse(id: number): CreateUserResponse {
    const response = new UpdateUserResponse();
    response.UserID = id;
    return response;
}

