import { HttpError } from './../model/http/HttpError';
import { injectable, inject } from 'inversify';
import { IAuthenticationService } from './../services/';
import { ICommunicator } from './ICommunicator';
import { UserType } from '../model';

@injectable()
export class AuthenticationCommunicator implements ICommunicator {

    private authenticationService: IAuthenticationService;

    public constructor( @inject("IAuthenticationService") authenticationService: IAuthenticationService) {
        this.authenticationService = authenticationService;
    }

    public registerNamespace(socketIO: any): void {
        const nsp = socketIO.of('/authentication');
        nsp.on('connection', (client) => {
            this.registerLogin(client);
        });
    }

    private registerLogin(client: any): void {
        client.on('login', async (data) => {
            console.log("Login via Auth Service ...");
            await this.authenticationService
                .login(data.userName, data.password, UserType.AGENT)
                .then((token) => {
                    console.log("Login successful.");
                    client.emit('LoginResult', 'Login successful: ' + token);
                }).catch((error: HttpError) => {
                    // TODO: Use LogginsService
                    console.log("Login error.");
                    client.emit('LoginResult', 'Login error: ' + error);
                });
        });
    }
}
