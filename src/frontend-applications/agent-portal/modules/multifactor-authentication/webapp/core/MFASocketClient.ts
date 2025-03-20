/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../model/IdService';
import { ClientStorageService } from '../../../base-components/webapp/core/ClientStorageService';
import { ISocketRequest } from '../../../base-components/webapp/core/ISocketRequest';
import { SocketClient } from '../../../base-components/webapp/core/SocketClient';
import { UserType } from '../../../user/model/UserType';
import { MFAConfig } from '../../model/MFAConfig';
import { MFAConfigsResponse } from '../../model/MFAConfigsResponse';
import { MFAEvent } from '../../model/MFAEvent';
import { MFARequiredForUserRequest } from '../../model/MFARequiredForUserRequest';
import { MFARequiredForUserResponse } from '../../model/MFARequiredForUserResponse';

export class MFASocketClient extends SocketClient {

    private static INSTANCE: MFASocketClient = null;

    public static getInstance(): MFASocketClient {
        if (!MFASocketClient.INSTANCE) {
            MFASocketClient.INSTANCE = new MFASocketClient();
        }

        return MFASocketClient.INSTANCE;
    }

    public constructor() {
        super('mfa');
    }

    public async isMFAEnabled(login: string, userType: UserType, mfaConfig: MFAConfig): Promise<boolean> {
        this.checkSocketConnection();

        return new Promise<boolean>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            this.socket.on(MFAEvent.MFA_REQUIRED_FOR_USER_FINISHED, (result: MFARequiredForUserResponse) => {
                if (result.requestId === requestId) {
                    resolve(result.isMFARequired);
                }
            });

            const request = new MFARequiredForUserRequest(requestId, login, userType, mfaConfig);
            this.socket.emit(MFAEvent.MFA_REQUIRED_FOR_USER, request);
        });
    }

    public async loadMFAConfigs(userType: UserType): Promise<MFAConfig[]> {
        this.checkSocketConnection();

        return new Promise<MFAConfig[]>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            this.socket.on(MFAEvent.MFA_CONFIGS_LOADED, (result: MFAConfigsResponse) => {
                if (result.requestId === requestId) {
                    resolve(result.mfaConfigs);
                }
            });

            const request = {
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId(),
                userType
            };
            this.socket.emit(MFAEvent.LOAD_MFA_CONFIGS, request);
        });
    }
}
