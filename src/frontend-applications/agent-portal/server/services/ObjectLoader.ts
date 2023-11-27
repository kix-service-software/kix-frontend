/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { KIXObject } from '../../model/kix/KIXObject';
import { KIXObjectServiceRegistry } from './KIXObjectServiceRegistry';
import { ObjectResponse } from './ObjectResponse';

export class ObjectLoader {

    private static INSTANCE: ObjectLoader;

    public static getInstance(): ObjectLoader {
        if (!ObjectLoader.INSTANCE) {
            ObjectLoader.INSTANCE = new ObjectLoader();
        }
        return ObjectLoader.INSTANCE;
    }

    private constructor() { }

    private objectIdMap: Map<string, Map<string, [(object: any) => void, (error: any) => void]>> = new Map();

    private timeout: any;

    public queue<T = any>(objectType: string, objectId: string | number): Promise<T> {
        if (!objectType || !objectId) {
            return null;
        }

        return new Promise<T>((resolve, reject) => {

            if (!this.objectIdMap.has(objectType)) {
                this.objectIdMap.set(objectType, new Map());
            }

            this.objectIdMap.get(objectType).set(objectId.toString(), [resolve, reject]);
            this.load();
        });
    }

    private load(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.objectIdMap.forEach((value, key) => {
                this.loadObjects(key, value);
                this.objectIdMap.delete(key);
            });
        }, 150);
    }

    private async loadObjects(
        objectType: string, objectMap: Map<number | string, [(object: any) => void, (error) => void]>
    ): Promise<void> {
        try {
            const service = KIXObjectServiceRegistry.getServiceInstance(objectType);
            const config = ConfigurationService.getInstance().getServerConfiguration();

            const objectIds = [...objectMap.keys()];

            const objectResponse = await service.loadObjects<KIXObject>(
                config?.BACKEND_API_TOKEN, 'KIXObjectAPIService', objectType, objectIds, null, null
            ).catch((): ObjectResponse<KIXObject> => new ObjectResponse());

            const objectClass = service.getObjectClass(objectType);

            if (objectClass && objectResponse.objects?.length) {
                for (const obj of objectResponse.objects) {
                    const object = new objectClass(obj);
                    const cb = objectMap.get(object.ObjectId?.toString());
                    if (cb?.length) {
                        cb[0](object);
                        objectMap.delete(object.ObjectId?.toString());
                    }
                }
            }

            if (objectMap.size > 0) {
                objectMap.forEach((cb, key) => cb[0](null));
            }
        } catch (e) {
            if (objectMap.size > 0) {
                objectMap.forEach((cb, key) => cb[1](null));
            }
        }
    }

}