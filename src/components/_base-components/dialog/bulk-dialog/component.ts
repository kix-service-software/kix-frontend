/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService, LabelService } from '../../../../core/browser';
import { BulkDialogContext, BulkService } from '../../../../core/browser/bulk';
import { EventService } from '../../../../core/browser/event';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { TabContainerEvent, TabContainerEventData } from '../../../../core/browser/components';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<BulkDialogContext>(BulkDialogContext.CONTEXT_ID);
        if (context) {
            const objects = await context.getObjectList(null);
            if (objects && !!objects.length) {
                const objectType = objects[0].KIXObjectType;
                BulkService.getInstance().initBulkManager(objectType, objects);
                const bulkManager = BulkService.getInstance().getBulkManager(objectType);
                bulkManager.reset();
                this.state.bulkManager = bulkManager;

                const labelProvider = LabelService.getInstance().getLabelProviderForType(objectType);
                const objectName = await labelProvider.getObjectName(true);

                const title = await TranslationService.translate('Translatable#Edit {0}', [objectName]);

                EventService.getInstance().publish(
                    TabContainerEvent.CHANGE_TITLE, new TabContainerEventData('bulk-dialog', title)
                );
            }
        }
    }
}

module.exports = Component;
