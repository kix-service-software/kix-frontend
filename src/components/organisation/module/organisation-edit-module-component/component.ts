import { AbstractMarkoComponent, ContextService, ActionFactory } from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, WidgetConfiguration,
    ConfiguredDialogWidget
} from '../../../../core/model';
import { ImportService } from '../../../../core/browser/import';
import { DialogService } from '../../../../core/browser/components/dialog';
import {
    OrganisationImportManager, OrganisationImportDialogContext, EditOrganisationDialogContext,
    NewOrganisationDialogContext, OrganisationCreateAction, OrganisationEditAction, OrganisationCreateContactAction
} from '../../../../core/browser/organisation';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ImportService.getInstance().registerImportManager(new OrganisationImportManager());

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const newOrganisationContext = new ContextDescriptor(
            NewOrganisationDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-organisation-dialog', ['organisations'], NewOrganisationDialogContext
        );
        ContextService.getInstance().registerContext(newOrganisationContext);

        const editOrganisationContext = new ContextDescriptor(
            EditOrganisationDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-organisation-dialog', ['organisations'], EditOrganisationDialogContext
        );
        ContextService.getInstance().registerContext(editOrganisationContext);

        const organisationImportDialogContext = new ContextDescriptor(
            OrganisationImportDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.IMPORT,
            false, 'import-dialog', ['organisations'], OrganisationImportDialogContext
        );
        ContextService.getInstance().registerContext(organisationImportDialogContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-organisation-dialog',
            new WidgetConfiguration(
                'new-organisation-dialog', 'Translatable#New Organisation', [], {},
                false, false, null, 'kix-icon-man-house-new'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-organisation-dialog',
            new WidgetConfiguration(
                'edit-organisation-dialog', 'Translatable#Edit Organisation', [], {},
                false, false, null, 'kix-icon-edit'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.EDIT
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'organisation-import-dialog',
            new WidgetConfiguration(
                'import-dialog', 'Translatable#Import Organisations', [], {},
                false, false, null, 'kix-icon-man-house-new'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.IMPORT
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('organisation-create-action', OrganisationCreateAction);
        ActionFactory.getInstance().registerAction('organisation-edit-action', OrganisationEditAction);
        ActionFactory.getInstance().registerAction(
            'organisation-create-contact-action', OrganisationCreateContactAction
        );
    }

}

module.exports = Component;
