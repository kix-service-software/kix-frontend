/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService, ActionFactory } from '../../../../core/browser';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, WidgetConfiguration,
    ConfiguredDialogWidget
} from '../../../../core/model';
import { ImportService } from '../../../../core/browser/import';
import { DialogService } from '../../../../core/browser/components/dialog';
import {
    OrganisationImportManager, OrganisationImportDialogContext, EditOrganisationDialogContext,
    NewOrganisationDialogContext, OrganisationCreateAction, OrganisationEditAction
} from '../../../../core/browser/organisation';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 301;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
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
                false, false, 'kix-icon-man-house-new'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-organisation-dialog',
            new WidgetConfiguration(
                'edit-organisation-dialog', 'Translatable#Edit Organisation', [], {},
                false, false, 'kix-icon-edit'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.EDIT
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'organisation-import-dialog',
            new WidgetConfiguration(
                'import-dialog', 'Translatable#Import Organisations', [], {},
                false, false, 'kix-icon-man-house-new'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.IMPORT
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('organisation-create-action', OrganisationCreateAction);
        ActionFactory.getInstance().registerAction('organisation-edit-action', OrganisationEditAction);
    }

}
