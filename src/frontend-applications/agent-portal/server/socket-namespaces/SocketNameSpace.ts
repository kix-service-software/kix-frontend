/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketNamespace } from './ISocketNamespace';
import { AuthenticationService } from '../../../../server/services/AuthenticationService';
import { SocketEvent } from '../../modules/base-components/webapp/core/SocketEvent';
import { ISocketRequest } from '../../modules/base-components/webapp/core/ISocketRequest';
import { ProfilingService } from '../../../../server/services/ProfilingService';
import { SocketResponse } from '../../modules/base-components/webapp/core/SocketResponse';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { LoggingService } from '../../../../server/services/LoggingService';
import { Namespace, Server, Socket } from 'socket.io';
import { SocketAuthenticationError } from '../../../../server/model/SocketAuthenticationError';
import { PermissionError } from '../../modules/user/model/PermissionError';
import { SocketErrorResponse } from '../../modules/base-components/webapp/core/SocketErrorResponse';
import { RequestCounter } from '../../../../server/services/RequestCounter';

export abstract class SocketNameSpace implements ISocketNamespace {

    protected abstract getNamespace(): string;

    protected abstract registerEvents(client: Socket): void;

    protected namespace: Namespace;

    public registerNamespace(server: Server): void {
        this.initialize();
        this.namespace = server.of('/' + this.getNamespace());
        this.namespace
            .on(SocketEvent.CONNECTION, (client: Socket) => {
                this.registerEvents(client);
            });

        this.namespace.on('connection', (socket) => {
            LoggingService.getInstance().info(`connection on ${this.getNamespace()}`);
        });
    }

    protected async initialize(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        if (serverConfig && serverConfig.LOG_REQUEST_QUEUES_INTERVAL) {
            setInterval(
                () => LoggingService.getInstance().debug(
                    `Socket Request Queue Length (${this.getNamespace()}): ${RequestCounter.getInstance().getPendingSocketRequestCount()}`
                ),
                serverConfig.LOG_REQUEST_QUEUES_INTERVAL
            );
        }
    }

    protected registerEventHandler<RQ extends ISocketRequest, RS>(
        client: Socket, event: string,
        handler: (data: RQ, client: Socket) => Promise<SocketResponse<RS>>
    ): void {
        client.on(event, async (data: RQ) => {

            // start profiling

            const logData = {};
            for (const key in data as any) {
                if (key !== 'token') {
                    if (key === 'parameter' && Array.isArray(data[key])) {
                        logData[key] = this.prepareParameterProperty(data[key]);
                    } else {
                        if (key.match(/password/i)) {
                            logData[key] = '*****';
                        } else {
                            // TODO: handle sub-structures (object/array)
                            logData[key] = data[key];
                        }
                    }
                }
            }

            const message = event + '\t' + this.getNamespace() + '\t' + JSON.stringify(logData);
            const profileTaskId = ProfilingService.getInstance().start(
                'SocketIO', message, { data: [data], requestId: data.clientRequestId }, false
            );
            RequestCounter.getInstance().countSocketRequestCounter();
            ProfilingService.getInstance().logStart(profileTaskId);

            const response = await handler(data, client).catch((error) => {
                if (error instanceof SocketAuthenticationError) {
                    client.emit(SocketEvent.INVALID_TOKEN, new SocketErrorResponse(data.requestId, error));
                } else if (error instanceof PermissionError) {
                    client.emit(SocketEvent.PERMISSION_ERROR, new SocketErrorResponse(data.requestId, error));
                } else {
                    client.emit(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error));
                }

                return null;
            });

            let responseData = [];
            if (response) {
                client.emit(response.event, response.data);
                responseData = response.data;
            }

            RequestCounter.getInstance().countSocketRequestCounter(false);
            ProfilingService.getInstance().stop(profileTaskId, { data: [responseData] });
        });
    }

    private prepareParameterProperty(parameter: Array<[string, any]>): Array<[string, any]> {
        const newParameter = [];
        for (const param of parameter) {
            if (Array.isArray(param)) {
                let value = param[1];
                if (param[0].match(/password/i) || param[0].match(/^UserPw$/)) {
                    value = '*****';
                }
                // TODO: handle value sub-structures (object/array)
                newParameter.push([param[0], value]);
            } else {
                newParameter.push(param);
            }
        }
        return newParameter;
    }

}

