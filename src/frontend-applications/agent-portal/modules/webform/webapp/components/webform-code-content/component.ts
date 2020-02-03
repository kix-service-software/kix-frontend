/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
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

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        WidgetService.getInstance().setWidgetType('web-form-code-group', WidgetType.GROUP);
        const webform: Webform = input.webform;
        if (webform) {
            this.state.translations = await TranslationService.createTranslationObject([
                "Translatable#Include this code into the <head> area of your webpage.",
                "Translatable#Place this code wherever you want to open the webform dialog."
            ]);
            // tslint:disable: max-line-length
            this.state.headCode =
                `&lt;script&gt;var kixWebFormURL = 'https://&lt;YOUR_FRONTEND_HOST&gt;/integrations';&lt;/script&gt;</br>
                &lt;script src="https://&lt;YOUR_FRONTEND_HOST&gt;/static/integration/kix-form.js"&gt;&lt;/script&gt;</br>
                &lt;link href="https://&lt;YOUR_FRONTEND_HOST&gt;/static/integration/kix-form.css" rel="stylesheet"&gt;`;
            this.state.buttonCode =
                `&lt;button class="kix-web-form-start-button" id="${webform.ObjectId}" disabled&gt;${webform.buttonLabel}&lt;/button&gt;`;
        }
    }

}

module.exports = Component;
