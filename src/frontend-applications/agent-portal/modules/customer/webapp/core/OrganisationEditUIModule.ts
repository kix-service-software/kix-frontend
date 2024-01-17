/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ImportService } from '../../../import/webapp/core';
import { OrganisationDuplicateAction } from './actions/OrganisationDuplicateAction';
import { SetupService } from '../../../setup-assistant/webapp/core/SetupService';
import { SetupStep } from '../../../setup-assistant/webapp/core/SetupStep';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { OrganisationImportRunner } from './import/OrganisationImportRunner';
import { OrganisationImportManager } from './import/OrganisationImportManager';
import { OrganisationCreateAction, OrganisationEditAction } from './actions';
import { EditOrganisationDialogContext } from './context/EditOrganisationDialogContext';
import { NewOrganisationDialogContext } from './context/NewOrganisationDialogContext';
import { OrganisationDetailsContext } from './context/OrganisationDetailsContext';
import { OrganisationImportDialogContext } from './context/OrganisationImportDialogContext';

export class UIModule implements IUIModule {

    public priority: number = 301;

    public name: string = 'OrganisationEditUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ImportService.getInstance().registerImportManager(new OrganisationImportManager());
        ImportService.getInstance().registerImportRunner(new OrganisationImportRunner());

        this.registerContexts();
        this.registerActions();

        SetupService.getInstance().registerSetupStep(
            new SetupStep(
                'SetupMyOrganisation', 'Translatable#My Organisation', 'setup-my-organisation',
                [
                    new UIComponentPermission('organisations', [CRUD.READ]),
                    new UIComponentPermission('system/config/Organization', [CRUD.UPDATE])
                ],
                'Translatable#Rename Your Organisation', 'Translatable#setupt_assistant_my-organisation_text',
                'kix-icon-man-house', 50
            )
        );
    }

    private registerContexts(): void {
        const newOrganisationContext = new ContextDescriptor(
            NewOrganisationDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.CREATE,
            false, 'object-dialog', ['organisations'], NewOrganisationDialogContext,
            [
                new UIComponentPermission('organisations', [CRUD.CREATE])
            ],
            'Translatable#Organisation', 'kix-icon-man-house', OrganisationDetailsContext.CONTEXT_ID, 300
        );
        ContextService.getInstance().registerContext(newOrganisationContext);

        const editOrganisationContext = new ContextDescriptor(
            EditOrganisationDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.EDIT,
            false, 'object-dialog', ['organisations'], EditOrganisationDialogContext,
            [
                new UIComponentPermission('organisations', [CRUD.CREATE])
            ],
            'Translatable#Organisation', 'kix-icon-man-house', OrganisationDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(editOrganisationContext);

        const organisationImportDialogContext = new ContextDescriptor(
            OrganisationImportDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.IMPORT,
            false, 'import-dialog', ['organisations'], OrganisationImportDialogContext,
            [
                new UIComponentPermission('organisations', [CRUD.CREATE])
            ],
            'Translatable#Import Organisations', 'kix-icon-gear',
            undefined, undefined, false
        );
        ContextService.getInstance().registerContext(organisationImportDialogContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('organisation-create-action', OrganisationCreateAction);
        ActionFactory.getInstance().registerAction('organisation-edit-action', OrganisationEditAction);
        ActionFactory.getInstance().registerAction('organisation-duplicate-action', OrganisationDuplicateAction);
    }

}
