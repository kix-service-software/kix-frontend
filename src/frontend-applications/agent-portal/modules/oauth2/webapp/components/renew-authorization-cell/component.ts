/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { Cell } from '../../../../table/model/Cell';
import { OAuth2Profile } from '../../../model/OAuth2Profile';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AuthURLLoadingOptions } from '../../../model/AuthURLLoadingOptions';

class Component extends AbstractMarkoComponent<ComponentState> {

    private profile: OAuth2Profile;
    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.cell) {
            const cell: Cell = input.cell;
            this.profile = cell?.getRow()?.getRowObject()?.getObject();
            this.update();
        }
    }

    public async onMount(): Promise<void> {
        this.state.translations = [
            await TranslationService.translate('Translatable#Renew Authorization')
        ];
    }

    private async update(): Promise<void> {
        this.state.show = this.profile && this.profile instanceof OAuth2Profile;
    }

    public async labelClicked(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        // get url now and never from cache (backend state handling)
        const urls = await KIXObjectService.loadObjects(
            KIXObjectType.OAUTH2_PROFILE_AUTH_URL, undefined, undefined,
            new AuthURLLoadingOptions(Number(this.profile.ID)), true, false
        ).catch(() => [] as string[]);
        if (urls?.length) {
            window.open(urls[0] as string, '_blank');
        }
    }

}

module.exports = Component;
