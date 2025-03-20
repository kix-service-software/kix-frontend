/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { VirtualFS } from '../../model/VirtualFS';


export class VirtualFSService extends KIXObjectService {

    private static INSTANCE: VirtualFSService = null;

    public static getInstance(): VirtualFSService {
        if (!VirtualFSService.INSTANCE) {
            VirtualFSService.INSTANCE = new VirtualFSService();
        }

        return VirtualFSService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.VIRTUAL_FS);
        this.objectConstructors.set(KIXObjectType.VIRTUAL_FS, [VirtualFS]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.VIRTUAL_FS;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean, silent?: boolean, collectionId?: string
    ): Promise<O[]> {
        let objects: O[];
        objects = await super.loadObjects<O>(
            objectType, objectIds, loadingOptions, objectLoadingOptions, cache, forceIds, silent, collectionId
        );

        return objects;
    }

    public getLinkObjectName(): string {
        return 'VirtualFS';
    }


    protected getResource(objectType: KIXObjectType): string {
        if (objectType === KIXObjectType.VIRTUAL_FS) {
            return 'virtualfs';
        } else {
            return super.getResource(objectType);
        }
    }

}
