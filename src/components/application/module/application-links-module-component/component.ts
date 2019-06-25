import {
    AbstractMarkoComponent, ActionFactory, ContextService, LabelService, TableFactoryService
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from '../../../../core/model';
import {
    LinkedObjectsEditAction, EditLinkedObjectsDialogContext, LinkObjectTableFactory,
    LinkObjectLabelProvider, LinkObjectDialogContext
} from '../../../../core/browser/link';
import { DialogService } from '../../../../core/browser/components/dialog';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        TableFactoryService.getInstance().registerFactory(new LinkObjectTableFactory());
        LabelService.getInstance().registerLabelProvider(new LinkObjectLabelProvider());
        ActionFactory.getInstance().registerAction('linked-objects-edit-action', LinkedObjectsEditAction);

        this.registerContexts();
        this.registerDialogs();
    }

    public registerContexts(): void {
        const linkObjectDialogContext = new ContextDescriptor(
            LinkObjectDialogContext.CONTEXT_ID, [KIXObjectType.LINK],
            ContextType.DIALOG, ContextMode.CREATE,
            false, 'link-objects-dialog', ['links'], LinkObjectDialogContext
        );
        ContextService.getInstance().registerContext(linkObjectDialogContext);

        const editLinkObjectDialogContext = new ContextDescriptor(
            EditLinkedObjectsDialogContext.CONTEXT_ID, [KIXObjectType.LINK],
            ContextType.DIALOG, ContextMode.EDIT_LINKS,
            false, 'edit-linked-objects-dialog', ['links'], EditLinkedObjectsDialogContext
        );
        ContextService.getInstance().registerContext(editLinkObjectDialogContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-linked-objects-dialog',
            new WidgetConfiguration(
                'edit-linked-objects-dialog', 'Translatable#Edit Links', [], {}, false, false, 'kix-icon-link'
            ),
            KIXObjectType.LINK,
            ContextMode.EDIT_LINKS
        ));
    }

}

module.exports = Component;
