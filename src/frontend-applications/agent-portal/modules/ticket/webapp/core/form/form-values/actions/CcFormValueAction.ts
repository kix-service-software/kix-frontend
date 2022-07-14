/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormValueAction } from '../../../../../../object-forms/model/FormValues/FormValueAction';
import { ArticleProperty } from '../../../../../model/ArticleProperty';


export class CcFormValueAction extends FormValueAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Cc';
        this.icon = 'kix-icon-man-mail-cc';
    }

    public async canShow(): Promise<boolean> {
        const ccValue = this.objectValueMapper?.findFormValue(ArticleProperty.CC);
        return ccValue?.enabled;
    }

    public canRun(): boolean {
        const ccValue = this.objectValueMapper?.findFormValue(ArticleProperty.CC);
        return ccValue?.enabled;
    }

    public isActive(): boolean {
        const ccValue = this.objectValueMapper?.findFormValue(ArticleProperty.CC);
        return ccValue?.enabled && ccValue?.visible;
    }

    public async run(event: any): Promise<void> {
        const ccValue = this.objectValueMapper?.findFormValue(ArticleProperty.CC);

        if (ccValue) {
            const visible = !ccValue.visible;

            ccValue.setNewInitialState('visible', visible);

            ccValue.visible = visible;

            if (!visible) {
                ccValue.value = null;
            }
        }
    }
}