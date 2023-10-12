/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../base-components/webapp/core/AbstractAction';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SysConfigOptionDefinitionProperty } from '../../model/SysConfigOptionDefinitionProperty';
import { SysConfigOptionDefinition } from '../../model/SysConfigOptionDefinition';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { SysconfigEvent } from './SysconfigEvent';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';

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

            const title = await TranslationService.translate('Translatable#Reset?');
            const question = await TranslationService.translate(
                'Translatable#You will reset {0} Sysconfig Options. Execute now?', [objects.length]
            );

            BrowserUtil.openConfirmOverlay(title, question, async () => {
                let i = 1;
                for (const o of objects) {
                    EventService.getInstance().publish(
                        ApplicationEvent.APP_LOADING,
                        { loading: true, hint: `Reset Sysconfig Options ${i}/${objects.length}` }
                    );

                    await KIXObjectService.updateObject(KIXObjectType.SYS_CONFIG_OPTION,
                        [
                            [SysConfigOptionDefinitionProperty.VALUE, null],
                            [KIXObjectProperty.VALID_ID, null]
                        ], o.Name, true
                    );
                    i++;
                }

                EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
                EventService.getInstance().publish(SysconfigEvent.SYSCONFIG_OPTIONS_UPDATED);
            });
        }
    }
}
