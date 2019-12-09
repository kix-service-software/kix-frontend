/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../frontend-applications/agent-portal/model/IUIModule";
import { ContextDescriptor } from "../../../../frontend-applications/agent-portal/model/ContextDescriptor";
import { KIXObjectType } from "../../../../frontend-applications/agent-portal/model/kix/KIXObjectType";
import { ContextType } from "../../../../frontend-applications/agent-portal/model/ContextType";
import { ContextMode } from "../../../../frontend-applications/agent-portal/model/ContextMode";
import {
    ContextService
} from "../../../../frontend-applications/agent-portal/modules/base-components/webapp/core/ContextService";
import { CalendarContext } from "./CalendarContext";

export class UIModule implements IUIModule {

    public name: string = "Calendar";

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
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
