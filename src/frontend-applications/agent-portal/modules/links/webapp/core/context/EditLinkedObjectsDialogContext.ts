/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';


export class EditLinkedObjectsDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-linked-objects-dialog-context';

    private loadingOptions: Map<string, KIXObjectLoadingOptions>;

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType | string = null, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object: O;

        if (objectType === 'LinkObject') {
            const sourceContext = this.getAdditionalInformation(AdditionalContextInformation.SOURCE_CONTEXT);
            if (sourceContext?.instanceId) {
                const contextInstance = ContextService.getInstance().getContext(sourceContext.instanceId);
                object = await contextInstance?.getObject();
            }
        }

        return object;
    }

    public async reloadObjectList(objectType: string, silent?: boolean, limit?: number): Promise<void> {
        const loadingOptions = this.getAdditionalInformation('LinkObjectSearchLoadingOptions');
        await this.searchObjects(objectType, loadingOptions, limit);
    }

    public async searchObjects(
        objectType: string, loadingOptions: KIXObjectLoadingOptions, limit?: number
    ): Promise<void> {
        if (!this.loadingOptions) {
            this.loadingOptions = new Map();
        }

        if (loadingOptions) {
            this.loadingOptions.set(objectType, loadingOptions);
            let loadingOptionsToUse = KIXObjectLoadingOptions.clone(loadingOptions);
            loadingOptionsToUse.limit = limit;
            loadingOptionsToUse.searchLimit = 150;

            loadingOptionsToUse = await this.prepareContextLoadingOptions(objectType, loadingOptionsToUse);

            const objects = await KIXObjectService.loadObjects(
                objectType, null, loadingOptionsToUse, null, true,
                undefined, undefined, this.contextId + objectType
            ).catch(() => []);

            this.setObjectList(objectType, objects);
        }
    }


}
