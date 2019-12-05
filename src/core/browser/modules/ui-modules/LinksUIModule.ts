/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ActionFactory, ContextService, LabelService, TableFactoryService
} from '../../../../core/browser';
import { ContextDescriptor, KIXObjectType, ContextType, ContextMode } from '../../../../core/model';
import {
    LinkedObjectsEditAction, EditLinkedObjectsDialogContext, LinkObjectTableFactory,
    LinkObjectLabelProvider, LinkObjectDialogContext
} from '../../../../core/browser/link';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 1000;

    public name: string = 'LinksUIModule';

    public unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        TableFactoryService.getInstance().registerFactory(new LinkObjectTableFactory());
        LabelService.getInstance().registerLabelProvider(new LinkObjectLabelProvider());
        ActionFactory.getInstance().registerAction('linked-objects-edit-action', LinkedObjectsEditAction);

        await this.registerContexts();
    }

    public async registerContexts(): Promise<void> {
        const linkObjectDialogContext = new ContextDescriptor(
            LinkObjectDialogContext.CONTEXT_ID, [KIXObjectType.LINK],
            ContextType.DIALOG, ContextMode.CREATE_LINK,
            false, 'link-objects-dialog', ['links'], LinkObjectDialogContext
        );
        await ContextService.getInstance().registerContext(linkObjectDialogContext);

        const editLinkObjectDialogContext = new ContextDescriptor(
            EditLinkedObjectsDialogContext.CONTEXT_ID, [KIXObjectType.LINK],
            ContextType.DIALOG, ContextMode.EDIT_LINKS,
            false, 'edit-linked-objects-dialog', ['links'], EditLinkedObjectsDialogContext
        );
        await ContextService.getInstance().registerContext(editLinkObjectDialogContext);
    }

}
