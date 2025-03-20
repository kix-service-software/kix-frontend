/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Server, Socket } from 'socket.io';
import { SocketNameSpace } from '../../../server/socket-namespaces/SocketNameSpace';
import { SocketEvent } from '../../base-components/webapp/core/SocketEvent';
import { SocketResponse } from '../../base-components/webapp/core/SocketResponse';
import { MFAEvent } from '../model/MFAEvent';
import { MFARequiredForUserRequest } from '../model/MFARequiredForUserRequest';
import { MFARequiredForUserResponse } from '../model/MFARequiredForUserResponse';
import { MFAService } from './MFAService';
import { ISocketRequest } from '../../base-components/webapp/core/ISocketRequest';
import { MFAConfigsResponse } from '../model/MFAConfigsResponse';

export class MFANamespace extends SocketNameSpace {

    private static INSTANCE: MFANamespace;

    public static getInstance(): MFANamespace {
        if (!MFANamespace.INSTANCE) {
            MFANamespace.INSTANCE = new MFANamespace();
        }
        return MFANamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'mfa';
    }

    public registerNamespace(socketIO: Server): void {
        const nsp = socketIO.of('/' + this.getNamespace());
        nsp.on(SocketEvent.CONNECTION, (client: Socket) => this.registerEvents(client));
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, MFAEvent.MFA_REQUIRED_FOR_USER, this.checkForMFA.bind(this));
        this.registerEventHandler(client, MFAEvent.LOAD_MFA_CONFIGS, this.loadMFAConfigs.bind(this));
    }

    private async checkForMFA(data: MFARequiredForUserRequest): Promise<SocketResponse> {
        const userNeedOTP = await MFAService.getInstance().isUserMFAPEnabled(data.login, data.userType, data.mfaConfig);
        const response = new SocketResponse(
            MFAEvent.MFA_REQUIRED_FOR_USER_FINISHED, new MFARequiredForUserResponse(data.requestId, userNeedOTP)
        );
        return response;
    }

    private async loadMFAConfigs(data): Promise<SocketResponse> {
        const mfaConfigs = await MFAService.getInstance().loadMFAConfigs(data.userType);
        const response = new SocketResponse(
            MFAEvent.MFA_CONFIGS_LOADED, new MFAConfigsResponse(data.requestId, mfaConfigs)
        );
        return response;
    }

}
