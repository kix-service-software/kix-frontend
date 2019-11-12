/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    AbstractAction, Job, ComponentContent, ConfirmOverlayContent, OverlayType,
    KIXObjectType, JobProperty, ToastContent, Error
} from '../../../model';
import { ContextService } from '../../context';
import { TranslationService } from '../../i18n/TranslationService';
import { OverlayService } from '../../OverlayService';
import { EventService } from '../../event';
import { ApplicationEvent } from '../../application';
import { KIXObjectService } from '../../kix';

export class JobExecuteAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Run';
        this.icon = 'kix-icon-open-right';
    }

    public async run(event: any): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            const job = await context.getObject<Job>();

            if (job) {
                const question = await TranslationService.translate(
                    'Translatable#The Job {0} will be ran now. Are you sure?', [job.Name]
                );
                const content = new ComponentContent(
                    'confirm-overlay',
                    new ConfirmOverlayContent(question, this.executeJob.bind(this))
                );

                OverlayService.getInstance().openOverlay(OverlayType.CONFIRM, null, content, 'Translatable#Run', false);
            }
        }
    }

    private async executeJob(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            const job = await context.getObject<Job>();

            if (job) {
                EventService.getInstance().publish(
                    ApplicationEvent.APP_LOADING, { loading: true, hint: 'Job is running' }
                );

                await KIXObjectService.updateObject(KIXObjectType.JOB, [[JobProperty.EXEC, true]], job.ID, false)
                    .then(() => {
                        setTimeout(() => {
                            const content = new ComponentContent(
                                'toast',
                                new ToastContent('kix-icon-check', 'Translatable#Job successfully ran.')
                            );
                            OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
                        }, 1000);
                    }).catch((error: Error) => {
                        const content = new ComponentContent('list-with-title',
                            {
                                title: `Translatable#Error`,
                                list: [`${error.Code}: ${error.Message}`]
                            }
                        );
                        OverlayService.getInstance().openOverlay(
                            OverlayType.WARNING, null, content, 'Translatable#Error!', true
                        );
                    });

                EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
                EventService.getInstance().publish(ApplicationEvent.REFRESH);
            }
        }

    }
}
