/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';


export class EditLinkedObjectsDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-linked-objects-dialog-context';

    private loadingOptions: Map<string, KIXObjectLoadingOptions>;

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType | string = null, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        return null;
    }

    public async loadLinkedObjects(
        objectType: string, loadingOptions: KIXObjectLoadingOptions, limit?: number
    ): Promise<KIXObject[]> {
        if (!this.loadingOptions) {
            this.loadingOptions = new Map();
        }

        let objects;
        if (loadingOptions) {
            this.loadingOptions.set(objectType, loadingOptions);

            loadingOptions.limit = limit;
            loadingOptions.searchLimit = 150;

            await this.prepareContextLoadingOptions(objectType, loadingOptions);

            objects = await KIXObjectService.loadObjects(
                objectType, null, loadingOptions, null, true,
                undefined, undefined, this.contextId + objectType
            ).catch(() => []);

            this.setObjectList(objectType, objects);
        }
        return objects;
    }

    public async setSortOrder(objectType: string, sortOrder: string, reload: boolean = true): Promise<void> {
        super.setSortOrder(objectType, sortOrder, false);
        if (reload) {
            await this.loadLinkedObjects(objectType, this.loadingOptions.get(objectType));
        }
    }

    public async reloadObjectList(
        objectType: KIXObjectType | string, silent: boolean = false, limit?: number
    ): Promise<void> {
        await this.loadLinkedObjects(objectType, this.loadingOptions.get(objectType), limit);
    }

}
