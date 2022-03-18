/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { HomeContext } from './HomeContext';

export class UIModule implements IUIModule {

    public priority: number = 9999;

    public name: string = 'HomeUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        const homeContext = new ContextDescriptor(
            HomeContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'home', ['home'], HomeContext
        );
        ContextService.getInstance().registerContext(homeContext);
    }

}
