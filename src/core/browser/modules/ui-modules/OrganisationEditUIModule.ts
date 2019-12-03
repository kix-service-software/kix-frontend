/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService, ActionFactory } from '../../../../core/browser';
import { KIXObjectType, ContextDescriptor, ContextType, ContextMode } from '../../../../core/model';
import { ImportService } from '../../../../core/browser/import';
import {
    OrganisationImportManager, OrganisationImportDialogContext, EditOrganisationDialogContext,
    NewOrganisationDialogContext, OrganisationCreateAction, OrganisationEditAction
} from '../../../../core/browser/organisation';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 301;

    public name: string = 'OrganisationEditUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ImportService.getInstance().registerImportManager(new OrganisationImportManager());

        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const newOrganisationContext = new ContextDescriptor(
            NewOrganisationDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-organisation-dialog', ['organisations'], NewOrganisationDialogContext
        );
        await ContextService.getInstance().registerContext(newOrganisationContext);

        const editOrganisationContext = new ContextDescriptor(
            EditOrganisationDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-organisation-dialog', ['organisations'], EditOrganisationDialogContext
        );
        await ContextService.getInstance().registerContext(editOrganisationContext);

        const organisationImportDialogContext = new ContextDescriptor(
            OrganisationImportDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.IMPORT,
            false, 'import-dialog', ['organisations'], OrganisationImportDialogContext
        );
        await ContextService.getInstance().registerContext(organisationImportDialogContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('organisation-create-action', OrganisationCreateAction);
        ActionFactory.getInstance().registerAction('organisation-edit-action', OrganisationEditAction);
    }

}
