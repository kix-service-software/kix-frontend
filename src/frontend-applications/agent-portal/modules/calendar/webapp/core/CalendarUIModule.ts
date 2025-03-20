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
import { CalendarContext } from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class UIModule implements IUIModule {

    public name: string = 'Calendar';



    public priority: number = 800;

    public async register(): Promise<void> {
        const calendarContext = new ContextDescriptor(
            CalendarContext.CONTEXT_ID, [KIXObjectType.ANY],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'calendar-module', ['calendar'], CalendarContext
        );
        ContextService.getInstance().registerContext(calendarContext);
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

}
