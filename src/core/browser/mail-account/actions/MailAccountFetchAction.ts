/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction, KIXObjectType, Error, CRUD, MailAccountProperty } from '../../../model';
import { KIXObjectService } from '../../kix';
import { ContextService } from '../../context';
import { EventService } from '../../event';
import { BrowserUtil } from '../../BrowserUtil';
import { ApplicationEvent } from '../../application/ApplicationEvent';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { MailAccountDetailsContext } from '../context';
import { TranslationService } from '../../i18n/TranslationService';

export class MailAccountFetchAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/communication/mailaccounts/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Fetch now';
        this.icon = 'kix-icon-arrow-refresh';
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<MailAccountDetailsContext>(
            MailAccountDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();

            if (id) {
                EventService.getInstance().publish(
                    ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Fetching Mail Account' }
                );

                await KIXObjectService.updateObject(
                    KIXObjectType.MAIL_ACCOUNT, [[MailAccountProperty.EXEC_FETCH, 1]], id, false
                ).then(async () => {
                    EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
                    const toast = await TranslationService.translate(
                        'Translatable#Mail Account successfully fetched.'
                    );
                    BrowserUtil.openSuccessOverlay(toast);
                }).catch((error: Error) => {
                    EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
                    BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                });
            }
        }
    }
}
