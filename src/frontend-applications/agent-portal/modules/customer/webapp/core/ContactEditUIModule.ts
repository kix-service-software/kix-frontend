/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ContactImportManager } from './ContactImportManager';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import {
    NewContactDialogContext, EditContactDialogContext, ContactImportDialogContext,
    ContactCreateAction, ContactEditAction
} from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ImportService } from '../../../import/webapp/core/ImportService';
import { ContactDuplicateAction } from './actions/ContactDuplicateAction';

export class UIModule implements IUIModule {

    public name: string = 'ContactEditUIModule';

    public priority: number = 304;

    public unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ImportService.getInstance().registerImportManager(new ContactImportManager());

        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const newContactContext = new ContextDescriptor(
            NewContactDialogContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-contact-dialog', ['contacts'], NewContactDialogContext
        );
        await ContextService.getInstance().registerContext(newContactContext);

        const editContactContext = new ContextDescriptor(
            EditContactDialogContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-contact-dialog', ['contacts'], EditContactDialogContext
        );
        await ContextService.getInstance().registerContext(editContactContext);

        const contactImportDialogContext = new ContextDescriptor(
            ContactImportDialogContext.CONTEXT_ID, [KIXObjectType.CONTACT],
            ContextType.DIALOG, ContextMode.IMPORT,
            false, 'import-dialog', ['contacts'], ContactImportDialogContext
        );
        await ContextService.getInstance().registerContext(contactImportDialogContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('contact-create-action', ContactCreateAction);
        ActionFactory.getInstance().registerAction('contact-edit-action', ContactEditAction);
        ActionFactory.getInstance().registerAction('contact-duplicate-action', ContactDuplicateAction);
    }

}
