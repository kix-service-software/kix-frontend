import { AuthenticationResult, LoginRequest, UserType, AuthenticationEvent } from './../model-client/';
import { HttpError } from './../model/http/HttpError';
import { injectable, inject } from 'inversify';
import { IAuthenticationService } from './../services/';
import { ICommunicator } from './ICommunicator';

@injectable()
export class AuthenticationCommunicator implements ICommunicator {

    private authenticationService: IAuthenticationService;

    public constructor( @inject("IAuthenticationService") authenticationService: IAuthenticationService) {
        this.authenticationService = authenticationService;
    }

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/authentication');
        nsp.on('connection', (client: SocketIO.Socket) => {
            this.registerLogin(client);
        });
    }

    private registerLogin(client: SocketIO.Socket): void {
        client.on(AuthenticationEvent.LOGIN, async (data: LoginRequest) => {
            console.log("Login via Auth Service ...");
            await this.authenticationService
                .login(data.userName, data.password, data.userType)
                .then((token) => {
                    client.emit(AuthenticationEvent.AUTHORIZED,
                        new AuthenticationResult(token, 'http://localhost:3000'));
                }).catch((error: HttpError) => {
                    // TODO: Use LogginsService
                    console.log("Login error.");
                    client.emit(AuthenticationEvent.UNAUTHORIZED, error);
                });
        });
    }
}
