/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { BulkService } from '../../core/BulkService';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { IdService } from '../../../../../model/IdService';
import { Context } from '../../../../../model/Context';

class Component {

    private state: ComponentState;
    private listenerId: string;
    private context: Context;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.listenerId = IdService.generateDateBasedId();
        this.context = ContextService.getInstance().getActiveContext();
        this.context?.registerListener(this.listenerId, {
            additionalInformationChanged: () => null,
            filteredObjectListChanged: () => null,
            objectChanged: () => null,
            objectListChanged: () => this.update(),
            scrollInformationChanged: () => null,
            sidebarLeftToggled: () => null,
            sidebarRightToggled: () => null,
        });

        this.update();
    }

    public onDestroy(): void {
        this.context.unregisterListener(this.listenerId);

        if (this.state.bulkManager) {
            this.state.bulkManager.reset();
        }
    }

    private async update(): Promise<void> {
        const objects = await this.context?.getObjectList(null);
        if (Array.isArray(objects) && objects.length) {
            const objectType = objects[0].KIXObjectType;
            BulkService.getInstance().initBulkManager(objectType, objects);
            const bulkManager = BulkService.getInstance().getBulkManager(objectType);

            // reset only on startup
            if (!bulkManager.getValues().length) {
                bulkManager.reset(false, true);
            }

            this.state.bulkManager = bulkManager;

            const objectName = await LabelService.getInstance().getObjectName(objectType, true);
            this.state.title = await TranslationService.translate('Translatable#Bulk Action: {0}', [objectName]);

            this.state.icon = LabelService.getInstance().getObjectIconForType(objectType);
        }
    }
}

module.exports = Component;
