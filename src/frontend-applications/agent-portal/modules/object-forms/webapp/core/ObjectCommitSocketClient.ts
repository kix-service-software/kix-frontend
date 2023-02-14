/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../model/IdService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { BrowserCacheService } from '../../../base-components/webapp/core/CacheService';
import { ClientStorageService } from '../../../base-components/webapp/core/ClientStorageService';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { SocketClient } from '../../../base-components/webapp/core/SocketClient';
import { SocketErrorResponse } from '../../../base-components/webapp/core/SocketErrorResponse';
import { SocketEvent } from '../../../base-components/webapp/core/SocketEvent';
import { CommitObjectEvent } from '../../model/commit-object/CommitObjectEvent';
import { CommitObjectRequest } from '../../model/commit-object/CommitObjectRequest';
import { CommitObjectResponse } from '../../model/commit-object/CommitObjectResponse';

export class ObjectCommitSocketClient extends SocketClient {

    public static INSTANCE: ObjectCommitSocketClient;

    public static getInstance(): ObjectCommitSocketClient {
        if (!ObjectCommitSocketClient.INSTANCE) {
            ObjectCommitSocketClient.INSTANCE = new ObjectCommitSocketClient();
        }

        return ObjectCommitSocketClient.INSTANCE;
    }

    private constructor() {
        super('object-commit');
    }

    public async commitObject<T extends KIXObject = KIXObject>(object: T): Promise<number | string> {
        this.checkSocketConnection();

        return new Promise<number | string>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();

            this.socket.on(CommitObjectEvent.COMMIT_OBJECT_FINISHED, (response: CommitObjectResponse) => {
                if (requestId === response.requestId) {
                    BrowserCacheService.getInstance().deleteKeys(object.KIXObjectType);
                    EventService.getInstance().publish(
                        ApplicationEvent.OBJECT_CREATED,
                        {
                            objectType: object.KIXObjectType,
                            objectId: response.objectId
                        }
                    );
                    EventService.getInstance().publish(
                        ApplicationEvent.OBJECT_UPDATED,
                        {
                            objectType: object.KIXObjectType,
                            objectId: response.objectId
                        }
                    );
                    resolve(response.objectId);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    console.error(error.error);
                    reject(error.error);
                }
            });

            try {
                const organisationId = ClientStorageService.getOption('RelevantOrganisationID');

                this.socket.emit(
                    CommitObjectEvent.COMMIT_OBJECT,
                    new CommitObjectRequest(
                        requestId, ClientStorageService.getClientRequestId(), object, Number(organisationId)
                    )
                );
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });

    }

}