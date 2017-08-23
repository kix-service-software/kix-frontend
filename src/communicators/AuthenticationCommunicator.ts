import { IServerConfiguration } from './../model/';
import {
    AuthenticationResult,
    LoginRequest,
    UserType,
    AuthenticationEvent,
    SocketEvent
} from './../model-client/';
import { HttpError } from './../model/http/HttpError';
import { injectable, inject } from 'inversify';
import { IAuthenticationService, IConfigurationService } from './../services/';
import { ICommunicator } from './ICommunicator';

@injectable()
export class AuthenticationCommunicator implements ICommunicator {

    private serverConfig: IServerConfiguration;

    private authenticationService: IAuthenticationService;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IAuthenticationService") authenticationService: IAuthenticationService) {

        this.serverConfig = configurationService.getServerConfiguration();
        this.authenticationService = authenticationService;
    }

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/authentication');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerLogin(client);
        });
    }

    private registerLogin(client: SocketIO.Socket): void {
        client.on(AuthenticationEvent.LOGIN, async (data: LoginRequest) => {
            return await this.authenticationService
                .login(data.userName, data.password, data.userType)
                .then((token: string) => {
                    client.emit(AuthenticationEvent.AUTHORIZED,
                        new AuthenticationResult(token, this.serverConfig.FRONTEND_URL));
                })
                .catch((error: HttpError) => {
                    // TODO: Use LogginsService
                    console.log("Login error.");
                    client.emit(AuthenticationEvent.UNAUTHORIZED, error);
                });
        });
    }
}
