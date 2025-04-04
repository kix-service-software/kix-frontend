/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from './KIXObjectService';

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

    private loadingOptionsMap: Map<string, KIXObjectLoadingOptions> = new Map();

    private timeout: any;

    public setLoadingoptions(objectType: string, loadingOptions: KIXObjectLoadingOptions): void {
        this.loadingOptionsMap.set(objectType, loadingOptions);
    }

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
                this.loadingOptionsMap.delete(key);
            });
        }, 150);
    }

    private async loadObjects(
        objectType: string, objectMap: Map<number | string, [(object: any) => void, (error) => void]>
    ): Promise<void> {
        try {
            const objectIds = [...objectMap.keys()];
            const loadingOptions = this.loadingOptionsMap.has(objectType) ?
                this.loadingOptionsMap.get(objectType) : null;

            const objects = await KIXObjectService.loadObjects(objectType, objectIds, loadingOptions);

            for (const obj of objects) {
                const cb = objectMap.get(obj.ObjectId?.toString());
                if (cb?.length) {
                    cb[0](obj);
                    objectMap.delete(obj.ObjectId?.toString());
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