/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketNamespace } from "./ISocketNamespace";
import { AuthenticationService } from "../services/AuthenticationService";
import { SocketEvent } from "../../modules/base-components/webapp/core/SocketEvent";
import { ISocketRequest } from "../../modules/base-components/webapp/core/ISocketRequest";
import { ProfilingService } from "../../../../server/services/ProfilingService";
import { SocketResponse } from "../../modules/base-components/webapp/core/SocketResponse";

export abstract class SocketNameSpace implements ISocketNamespace {

    protected abstract getNamespace(): string;

    protected abstract registerEvents(client: SocketIO.Socket): void;

    protected namespace: SocketIO.Namespace;

    public registerNamespace(server: SocketIO.Server): void {
        this.initialize();
        this.namespace = server.of('/' + this.getNamespace());
        this.namespace
            .use(AuthenticationService.getInstance().isSocketAuthenticated.bind(AuthenticationService.getInstance()))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerEvents(client);
            });
    }

    protected async initialize(): Promise<void> {
        return;
    }

    protected registerEventHandler<RQ extends ISocketRequest, RS>(
        client: SocketIO.Socket, event: string, handler: (data: RQ) => Promise<SocketResponse<RS>>
    ): void {
        client.on(event, (data: RQ) => {

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

            const message = `${this.getNamespace()} / ${event} ${JSON.stringify(logData)}`;
            const profileTaskId = ProfilingService.getInstance().start('SocketIO', message, data);

            handler(data).then((response) => {
                client.emit(response.event, response.data);

                // stop profiling
                ProfilingService.getInstance().stop(profileTaskId, response.data);
            });

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
