/* tslint:disable no-var-requires no-unused-expression max-line-length */
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
    UpdateUserResponse,
    HttpError,
    IConfigurationService,
    IUserService
} from '@kix/core/';
import { container } from './../../src/Container';
import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('User Service', () => {
    let nockScope;
    let userService: IUserService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        userService = container.getDIContainer().get<IUserService>("IUserService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(userService).not.undefined;
    });

    describe('Create a valid request to retrieve a user.', () => {

        before(() => {
            nockScope
                .get('/users/12345')
                .reply(200, buildUserResponse());
        });

        it('should return a user object.', async () => {
            const user: User = await userService.getUser(12345);
            expect(user).not.undefined;
        });
    });

    describe('Get multiple users', () => {
        describe('Create a valid request to retrieve all users.', () => {

            before(() => {
                nockScope
                    .get('/users')
                    .reply(200, buildUsersResponse(4));
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
                nockScope
                    .get('/users')
                    .query({ limit: 5 })
                    .reply(200, buildUsersResponse(5));
            });

            it('should return a limited list of 5 users.', async () => {
                const users: User[] = await userService.getUsers(null, 5);
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
                expect(users.length).equal(5);
            });
        });

        describe('Create a valid request to retrieve a sorted list of users.', () => {

            before(() => {
                nockScope
                    .get('/users')
                    .query({ order: 'Down' })
                    .reply(200, buildUsersResponse(2));
            });

            it('should return a sorted list of users.', async () => {
                const users: User[] = await userService.getUsers(null, null, SortOrder.DOWN);
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of users witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get('/users')
                    .query({ changedafter: '20170815' })
                    .reply(200, buildUsersResponse(3));
            });

            it('should return a list of users filtered by changed after.', async () => {
                const users: User[] = await userService.getUsers(null, null, null, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted of users witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get('/users')
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildUsersResponse(6));
            });

            it('should return a limited list of users filtered by changed after.', async () => {
                const users: User[] = await userService.getUsers(null, 6, null, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users.length).equal(6);
                expect(users).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted of users', () => {

            before(() => {
                nockScope
                    .get('/users')
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildUsersResponse(6));
            });

            it('should return a limited, sorted list of users.', async () => {
                const users: User[] = await userService.getUsers(null, 6, SortOrder.UP);
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users.length).equal(6);
                expect(users).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of users witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get('/users')
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildUsersResponse(4));
            });

            it('should return a sorted list of users filtered by changed after.', async () => {
                const users: User[] = await userService.getUsers(null, null, SortOrder.UP, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });
        });
    });

    describe('Create User', () => {
        describe('Create a valid request to create a new user.', () => {

            before(() => {
                nockScope
                    .post('/users', new CreateUserRequest('login', 'firstName', 'lastName', 'email', 'password', 'phone', 'title'))
                    .reply(200, buildCreateUserResponse(123456));
            });

            it('should return a the id of the new users.', async () => {
                const userId = await userService.createUser('login', 'firstName', 'lastName', 'email', 'password', 'phone', 'title');
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post('/users', new CreateUserRequest('', 'firstName', 'lastName', 'email', 'password', 'phone', 'title'))
                    .reply(400, {});
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
                nockScope
                    .patch('/users/123456',
                    new UpdateUserRequest('login', 'firstName', 'lastName', 'email', 'password', 'phone', 'title', 1))
                    .reply(200, buildUpdateUserResponse(123456));
            });

            it('should return the id of the user.', async () => {
                const userId = await userService.updateUser(123456, 'login', 'firstName', 'lastName', 'email', 'password', 'phone', 'title', 1);
                expect(userId).equal(123456);
            });

        });

        describe('Create a valid request to partial update an existing user.', () => {

            before(() => {
                nockScope
                    .patch('/users/123456',
                    {
                        User: {
                            UserFirstname: 'firstName',
                            UserLastname: 'lastName'
                        }
                    })
                    .reply(200, buildUpdateUserResponse(123456));
            });

            it('should return a the id of the user.', async () => {
                const userId = await userService.updateUser(123456, null, 'firstName', 'lastName', null, null, null, null, null);
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing user.', () => {
            before(() => {
                nockScope
                    .patch('/users/123456',
                    new UpdateUserRequest('', 'firstName', 'lastName', 'email', 'password', 'phone', 'title', 1))
                    .reply(400, {});
            });

            it('should return a the id of the user.', async () => {
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

    describe('Get user Information based on token', () => {

        before(() => {
            const userResponse = new UserResponse();
            const user = new User();
            user.UserID = 123456;
            userResponse.User = user;

            nockScope
                .matchHeader('Authorization', "Token abcdefg12345")
                .get('/user')
                .reply(200, userResponse);
        });

        it('Should return a user with the id 123456 for the given token', async () => {
            const user: User = await userService.getUserByToken("abcdefg12345");
            expect(user.UserID).equal(123456);
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

