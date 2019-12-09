/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from "./SocketClient";
import { ClientStorageService } from "./ClientStorageService";
import { LoadKIXModulesRequest } from "./LoadKIXModulesRequest";
import { KIXModulesEvent } from "./KIXModulesEvent";
import { LoadKIXModulesResponse } from "./LoadKIXModulesResponse";
import { SocketErrorResponse } from "./SocketErrorResponse";
import { SocketEvent } from "./SocketEvent";
import { LoadFormConfigurationsRequest } from "./LoadFormConfigurationsRequest";
import { LoadFormConfigurationsResponse } from "./LoadFormConfigurationsResponse";
import { LoadReleaseInfoResponse } from "./LoadReleaseInfoResponse";
import { ISocketRequest } from "./ISocketRequest";
import { LoadObjectDefinitionsResponse } from "./LoadObjectDefinitionsResponse";
import { LoadFormConfigurationRequest } from "./LoadFormConfigurationRequest";
import { LoadFormConfigurationResponse } from "./LoadFormConfigurationResponse";
import { IKIXModuleExtension } from "../../../../model/IKIXModuleExtension";
import { IdService } from "../../../../model/IdService";
import { FormContext } from "../../../../model/configuration/FormContext";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { ReleaseInfo } from "../../../../model/ReleaseInfo";
import { ObjectDefinition } from "../../../../model/kix/ObjectDefinition";

export class KIXModulesSocketClient extends SocketClient {

    public static getInstance(): KIXModulesSocketClient {
        if (!KIXModulesSocketClient.INSTANCE) {
            KIXModulesSocketClient.INSTANCE = new KIXModulesSocketClient();
        }

        return KIXModulesSocketClient.INSTANCE;
    }

    private static INSTANCE: KIXModulesSocketClient = null;

    public constructor() {
        super();
        this.socket = this.createSocket('kixmodules', true);
    }

    public loadModules(): Promise<IKIXModuleExtension[]> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request = new LoadKIXModulesRequest(token, requestId, ClientStorageService.getClientRequestId());

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_MODULES);
            }, 30000);

            this.socket.on(KIXModulesEvent.LOAD_MODULES_FINISHED, (result: LoadKIXModulesResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.modules);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(KIXModulesEvent.LOAD_MODULES, request);
        });
    }

    public loadFormConfigurations(
    ): Promise<Array<[FormContext, KIXObjectType | string, string]>> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request = new LoadFormConfigurationsRequest(
                token, requestId, ClientStorageService.getClientRequestId()
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_FORM_CONFIGURATIONS);
            }, 30000);

            this.socket.on(KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_FINISHED,
                (result: LoadFormConfigurationsResponse) => {
                    if (requestId === result.requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.formIDsWithContext);
                    }
                }
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(KIXModulesEvent.LOAD_FORM_CONFIGURATIONS, request);
        });
    }

    public loadFormConfiguration(formId: string): Promise<FormConfiguration> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request = new LoadFormConfigurationRequest(
                token, requestId, ClientStorageService.getClientRequestId(), formId
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_FORM_CONFIGURATION);
            }, 30000);

            this.socket.on(KIXModulesEvent.LOAD_FORM_CONFIGURATION_FINISHED,
                (result: LoadFormConfigurationResponse) => {
                    if (requestId === result.requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.form);
                    }
                }
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(KIXModulesEvent.LOAD_FORM_CONFIGURATION, request);
        });
    }



    public async loadReleaseConfig(): Promise<ReleaseInfo> {
        return new Promise<ReleaseInfo>((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_MODULES);
            }, 30000);

            this.socket.on(KIXModulesEvent.LOAD_RELEASE_INFO_FINISHED, (result: LoadReleaseInfoResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.releaseInfo);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                token,
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };
            this.socket.emit(KIXModulesEvent.LOAD_RELEASE_INFO, request);
        });
    }

    public async loadObjectDefinitions(): Promise<ObjectDefinition[]> {
        return new Promise<ObjectDefinition[]>((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_OBJECT_DEFINITIONS);
            }, 30000);

            this.socket.on(
                KIXModulesEvent.LOAD_OBJECT_DEFINITIONS_FINISHED,
                (result: LoadObjectDefinitionsResponse) => {
                    if (requestId === result.requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.objectDefinitions);
                    }
                }
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                token,
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };
            this.socket.emit(KIXModulesEvent.LOAD_OBJECT_DEFINITIONS, request);
        });
    }
}
