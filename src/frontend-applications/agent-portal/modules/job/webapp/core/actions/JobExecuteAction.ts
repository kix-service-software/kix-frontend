/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Job } from '../../../model/Job';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { ConfirmOverlayContent } from '../../../../../modules/base-components/webapp/core/ConfirmOverlayContent';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { JobProperty } from '../../../model/JobProperty';
import { ToastContent } from '../../../../../modules/base-components/webapp/core/ToastContent';
import { Error } from '../../../../../../../server/model/Error';
import { StringContent } from '../../../../../modules/base-components/webapp/core/StringContent';

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

                OverlayService.getInstance().openOverlay(
                    OverlayType.CONFIRM, null, content, 'Translatable#Run', null, false
                );
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
                        const content = new StringContent(
                            'Translatable#An error occured during job execution. See system log for details.'
                        );

                        OverlayService.getInstance().openOverlay(
                            OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                        );
                    });

                EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
            }
        }

    }
}
