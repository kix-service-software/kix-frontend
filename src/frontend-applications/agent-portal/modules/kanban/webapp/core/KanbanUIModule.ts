/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { KanbanContext } from '../core';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class UIModule implements IUIModule {

    public name: string = 'Kanban';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        this.registerContexts();
    }

    private registerContexts(): void {
        const kanbanContext = new ContextDescriptor(
            KanbanContext.CONTEXT_ID, [KIXObjectType.ANY],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'kanban-module', ['kanban'], KanbanContext
        );
        ContextService.getInstance().registerContext(kanbanContext);
    }
}
