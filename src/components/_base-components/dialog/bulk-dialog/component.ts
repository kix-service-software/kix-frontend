import { ComponentState } from './ComponentState';
import { ContextService, LabelService } from '../../../../core/browser';
import { BulkDialogContext, BulkService } from '../../../../core/browser/bulk';
import { EventService } from '../../../../core/browser/event';
import { TabContainerEvent } from '../../../../core/browser/components';

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
            const objects = await context.getObjectList();
            if (objects && objects.length) {
                const objectType = objects[0].KIXObjectType;
                BulkService.getInstance().initBulkManager(objectType, objects);
                const bulkManager = BulkService.getInstance().getBulkManager(objectType);
                bulkManager.reset();
                this.state.bulkManager = bulkManager;

                const labelProvider = LabelService.getInstance().getLabelProviderForType(objectType);
                const objectName = labelProvider.getObjectName(true);

                EventService.getInstance().publish(TabContainerEvent.CHANGE_TITLE, {
                    tabId: 'bulk-dialog',
                    title: `${objectName} bearbeiten`
                });
            }
        }
    }
}

module.exports = Component;
