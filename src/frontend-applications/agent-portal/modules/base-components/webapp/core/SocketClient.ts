/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ClientStorageService } from './ClientStorageService';
import { io, Socket } from 'socket.io-client';
import { SocketEvent } from './SocketEvent';
import { WindowListener } from './WindowListener';

export abstract class SocketClient {

    protected socket: Socket;

    public constructor(protected namespace: string) {
        this.createSocket();
    }

    protected checkSocketConnection(): void {
        if (!this.socket) {
            this.createSocket();
        }
    }

    protected createSocket(): void {
        const socketUrl = ClientStorageService.getFrontendSocketUrl();

        const options = {
            withCredentials: true
        };

        this.socket = io(socketUrl + '/' + this.namespace, options);

        this.socket.on(SocketEvent.INVALID_TOKEN, () => {
            console.error('Invalid Token! New login required.');
            this.socket.close();
            WindowListener.getInstance().logout();
        });

        this.socket.on('error', (error) => {
            console.error(this.namespace);
            console.error(error);

            if (error.name === 'SocketAuthenticationError') {
                WindowListener.getInstance().logout();
            }
        });

        this.socket.on('disconnect', () => {
            console.error(this.namespace);
            console.warn('Disconnected from frontend server.');
        });

        this.socket.on('reconnect', (number: number) => {
            console.error(this.namespace);
            console.warn('Reconnect attempt: ' + number);
        });

        this.socket.on('reconnect_attempt', () => {
            console.error(this.namespace);
            console.warn('Reconnect attempt');
        });

        this.socket.on('reconnect_error', (error) => {
            console.error(this.namespace);
            console.error('reconnect_error');
            console.error(error);
        });

        this.socket.on('reconnect_failed', (attempts) => {
            console.error(this.namespace);
            console.error('reconnect_failed: ' + attempts);
        });

        this.socket.on('connect_error', () => {
            // revert to classic upgrade
            this.socket.io.opts.transports = ['polling', 'websocket'];
        });
    }

}
