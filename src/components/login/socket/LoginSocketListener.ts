import {
    ClientStorageHandler,
    AuthenticationEvent,
    AuthenticationResult,
    LoginRequest,
    SocketEvent,
    UserType,
    TranslationEvent,
    LoadTranslationRequest,
    LoadTranslationResponse
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';

import { LOGIN_ERROR, TRANSLATIONS_LOADED } from '../store/actions';

import { LoginTranslationId } from '../model/LoginTranslationId';

declare var io: any;

export class LoginSocketListener extends SocketListener {

    private authenticationSocket: SocketIO.Server;
    private translationSocket: SocketIO.Server;
    private store: any;

    public constructor() {
        super();

        this.authenticationSocket = this.createSocket("authentication", false);
        this.translationSocket = this.createSocket("translation", false);
        this.store = require('../store');
        this.initTranslationSocketListener();
        this.initAuthenticationSocketListener();
    }

    public login(userName: string, password: string, userType: UserType): void {
        this.authenticationSocket.emit(AuthenticationEvent.LOGIN,
            new LoginRequest(userName, password, UserType.AGENT));
    }

    private initTranslationSocketListener(): void {
        this.translationSocket.on(SocketEvent.CONNECT, () => {
            this.translationSocket.emit(TranslationEvent.LOAD_TRANSLATIONS,
                new LoadTranslationRequest(null, [
                    LoginTranslationId.TITLE,
                    LoginTranslationId.BUTTON_LABEL,
                    LoginTranslationId.USERNAME,
                    LoginTranslationId.PASSWORD
                ])
            );
        });

        this.translationSocket.on(TranslationEvent.TRANSLATIONS_LOADED, (data: LoadTranslationResponse) => {
            this.store.dispatch(TRANSLATIONS_LOADED(data.translations));
        });
    }

    private initAuthenticationSocketListener(): void {
        this.authenticationSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(LOGIN_ERROR(null));
        });

        this.authenticationSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(LOGIN_ERROR('Connection to socket server failed. ' + JSON.stringify(error)));
        });

        this.authenticationSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(LOGIN_ERROR('Connection to socket server timeout.'));
        });

        this.authenticationSocket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
            document.cookie = "token=" + result.token;
            window.location.replace('/');
        });

        this.authenticationSocket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
            this.store.dispatch(LOGIN_ERROR('Invalid Login.'));
        });

        this.authenticationSocket.on('error', (error) => {
            this.store.dispatch(LOGIN_ERROR(error));
        });
    }
}
