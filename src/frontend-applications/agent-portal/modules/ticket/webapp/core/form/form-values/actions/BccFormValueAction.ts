/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormValueAction } from '../../../../../../object-forms/model/FormValues/FormValueAction';
import { ArticleProperty } from '../../../../../model/ArticleProperty';


export class BccFormValueAction extends FormValueAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Bcc';
        this.icon = 'kix-icon-man-mail-bcc';
    }

    public async canShow(): Promise<boolean> {
        const toValue = this.objectValueMapper?.findFormValue(ArticleProperty.TO);
        const bccValue = this.objectValueMapper?.findFormValue(ArticleProperty.BCC);

        let canShow = false;
        if (this.formValue.property === ArticleProperty.TO) {
            canShow = toValue?.enabled;
        } else if (this.formValue.property === ArticleProperty.CC) {
            canShow = !toValue.enabled;
        }

        return bccValue?.enabled && canShow;
    }

    public canRun(): boolean {
        const bccValue = this.objectValueMapper?.findFormValue(ArticleProperty.BCC);
        return bccValue?.enabled;
    }

    public isActive(): boolean {
        const bccValue = this.objectValueMapper?.findFormValue(ArticleProperty.BCC);
        return bccValue?.enabled && bccValue?.visible;
    }

    public async run(event: any): Promise<void> {
        const bccValue = this.objectValueMapper?.findFormValue(ArticleProperty.BCC);

        if (bccValue) {
            const visible = !bccValue.visible;

            bccValue.setNewInitialState('visible', visible);

            bccValue.visible = visible;

            if (!visible) {
                bccValue.value = null;
            }
        }
    }


}