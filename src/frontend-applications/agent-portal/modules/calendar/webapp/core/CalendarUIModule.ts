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
import { CalendarContext } from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class UIModule implements IUIModule {

    public name: string = 'Calendar';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        this.registerContexts();
    }

    private registerContexts(): void {
        const calendarContext = new ContextDescriptor(
            CalendarContext.CONTEXT_ID, [KIXObjectType.ANY],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'calendar-module', ['calendar'], CalendarContext
        );
        ContextService.getInstance().registerContext(calendarContext);
    }
}
