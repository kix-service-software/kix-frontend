/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from "../../../base-components/webapp/core/AbstractAction";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { SysConfigOptionDefinitionProperty } from "../../model/SysConfigOptionDefinitionProperty";
import { SysConfigOptionDefinition } from "../../model/SysConfigOptionDefinition";
import { ApplicationEvent } from "../../../base-components/webapp/core/ApplicationEvent";
import { EventService } from "../../../base-components/webapp/core/EventService";

export class SysconfigTableResetAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Reset';
        this.icon = 'kix-icon-arrow-rotate-left';
    }

    public canRun(): boolean {
        let canRun = false;
        if (this.data) {
            const rows = this.data.getSelectedRows();
            canRun = rows && rows.length > 0;
        }

        return canRun;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const rows = this.data.getSelectedRows();
            const objects: SysConfigOptionDefinition[] = rows.map((r) => r.getRowObject().getObject());

            let i = 1;
            for (const o of objects) {
                EventService.getInstance().publish(
                    ApplicationEvent.APP_LOADING,
                    { loading: true, hint: `Reset Sysconfig Options ${i}/${objects.length}` }
                );

                await KIXObjectService.updateObject(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
                    [[SysConfigOptionDefinitionProperty.VALUE, null]], o.Name, true
                );
                i++;
            }

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
            EventService.getInstance().publish(ApplicationEvent.REFRESH);
        }
    }

}
