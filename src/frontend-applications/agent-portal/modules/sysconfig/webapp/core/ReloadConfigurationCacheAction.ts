/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../base-components/webapp/core/AbstractAction';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { ContextSocketClient } from '../../../base-components/webapp/core/ContextSocketClient';
import { KIXModulesSocketClient } from '../../../base-components/webapp/core/KIXModulesSocketClient';
import { SysconfigEvent } from './SysconfigEvent';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class ReloadConfigurationCacheAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Reload Frontend Configurations';
        this.icon = 'kix-icon-check';
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const title = await TranslationService.translate('Translatable#Reload Frontend Configurations?');
            const question = await TranslationService.translate(
                'Translatable#Execute now?'
            );

            BrowserUtil.openConfirmOverlay(title, question, async () => {
                EventService.getInstance().publish(
                    ApplicationEvent.APP_LOADING,
                    { loading: true, hint: 'Translatable#Reload Agent Portal Configurations' }
                );
                await ContextSocketClient.getInstance().rebuildConfiguration().catch(() => null);
                await KIXModulesSocketClient.getInstance().rebuildConfiguration().catch(() => null);

                await ContextService.getInstance().reloadContextConfigurations();
                EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
                EventService.getInstance().publish(ApplicationEvent.CONFIGURATIONS_RELOADED);
                EventService.getInstance().publish(SysconfigEvent.SYSCONFIG_OPTIONS_UPDATED);
            });
        }
    }
}
