/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { OrganisationContext } from './context/OrganisationContext';

export class UIModule implements IUIModule {

    public priority: number = 300;

    public name: string = 'CustomerUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        const organisationListContext = new ContextDescriptor(
            OrganisationContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'organisations-module', ['organisations', 'contacts'], OrganisationContext,
            [
                new UIComponentPermission('organisations', [CRUD.READ], true),
                new UIComponentPermission('contacts', [CRUD.READ], true)
            ],
            'Translatable#Organisations Dashboard', 'kix-icon-man-bubble'
        );
        ContextService.getInstance().registerContext(organisationListContext);
    }

}
