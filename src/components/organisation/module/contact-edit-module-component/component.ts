import {
    AbstractMarkoComponent, ContextService, ActionFactory
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, WidgetConfiguration,
    ConfiguredDialogWidget
} from '../../../../core/model';
import {

    NewContactDialogContext, ContactCreateAction, ContactEditAction, EditContactDialogContext,
    ContactImportDialogContext
} from '../../../../core/browser/contact';
import { DialogService } from '../../../../core/browser/components/dialog';
import { ImportService } from '../../../../core/browser/import';
import { ContactImportManager } from '../../../../core/browser/contact/ContactImportManager';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ImportService.getInstance().registerImportManager(new ContactImportManager());

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const newContactContext = new ContextDescriptor(
            NewContactDialogContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-contact-dialog', ['contacts'], NewContactDialogContext
        );
        ContextService.getInstance().registerContext(newContactContext);

        const editContactContext = new ContextDescriptor(
            EditContactDialogContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-contact-dialog', ['contacts'], EditContactDialogContext
        );
        ContextService.getInstance().registerContext(editContactContext);

        const contactImportDialogContext = new ContextDescriptor(
            ContactImportDialogContext.CONTEXT_ID, [KIXObjectType.CONTACT],
            ContextType.DIALOG, ContextMode.IMPORT,
            false, 'import-dialog', ['contacts'], ContactImportDialogContext
        );
        ContextService.getInstance().registerContext(contactImportDialogContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-contact-dialog',
            new WidgetConfiguration(
                'new-contact-dialog', 'Translatable#New Contact', [], {}, false, false, 'kix-icon-man-bubble-new'
            ),
            KIXObjectType.CONTACT,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-contact-dialog',
            new WidgetConfiguration(
                'edit-contact-dialog', 'Translatable#Edit Contact', [], {}, false, false, 'kix-icon-edit'
            ),
            KIXObjectType.CONTACT,
            ContextMode.EDIT
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'contact-import-dialog',
            new WidgetConfiguration(
                'import-dialog', 'Translatable#Import Contacts', [], {}, false, false, 'kix-icon-man-bubble-new'
            ),
            KIXObjectType.CONTACT,
            ContextMode.IMPORT
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('contact-create-action', ContactCreateAction);
        ActionFactory.getInstance().registerAction('contact-edit-action', ContactEditAction);
    }

}

module.exports = Component;
