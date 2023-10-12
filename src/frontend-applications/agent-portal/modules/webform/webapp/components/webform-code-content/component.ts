/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { Webform } from '../../../model/Webform';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { SysConfigOption } from '../../../../sysconfig/model/SysConfigOption';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { SysConfigKey } from '../../../../sysconfig/model/SysConfigKey';

class Component extends AbstractMarkoComponent<ComponentState> {

    private editorTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        WidgetService.getInstance().setWidgetType('web-form-code-group', WidgetType.GROUP);
        const webform: Webform = input.webform;
        this.state.loading = true;
        if (this.editorTimeout) {
            window.clearTimeout(this.editorTimeout);
        }
        this.editorTimeout = setTimeout(async () => {
            if (webform) {
                this.state.translations = await TranslationService.createTranslationObject([
                    'Translatable#Include this code into the <head> area of your webpage.',
                    'Translatable#Place this code wherever you want to open the webform dialog.'
                ]);

                let hostString = '&lt;YOUR_FRONTEND_HOST&gt;';
                const fqdnConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.FQDN], null, null, true
                ).catch((error): SysConfigOption[] => []);
                if (fqdnConfig?.length && typeof fqdnConfig[0].Value === 'object' && fqdnConfig[0].Value['Frontend']) {
                    hostString = fqdnConfig[0].Value['Frontend'];
                }
                // tslint:disable: max-line-length
                this.state.headCode =
                    `&lt;script&gt;var kixWebFormURL = 'https://${hostString}/integrations';&lt;/script&gt;</br>
                &lt;script src="https://${hostString}/static/integration/kix-form.js"&gt;&lt;/script&gt;</br>
                &lt;link href="https://${hostString}/static/integration/kix-form.css" rel="stylesheet"&gt;`;
                this.state.buttonCode =
                    `&lt;button class="kix-web-form-start-button" id="${webform.ObjectId}" disabled&gt;${webform.buttonLabel}&lt;/button&gt;`;
            }
            this.state.loading = false;
        }, 500);
    }

}

module.exports = Component;
