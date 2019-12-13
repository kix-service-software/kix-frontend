/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../model/Context";
import { LabelService } from "../../../../../modules/base-components/webapp/core/LabelService";
import { Job } from "../../../model/Job";
import { BreadcrumbInformation } from "../../../../../model/BreadcrumbInformation";
import { TranslationService } from "../../../../translation/webapp/core";
import { AdminContext } from "../../../../admin/webapp/core";
import { KIXObject } from "../../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { EventService } from "../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";

export class JobDetailsContext extends Context {

    public static CONTEXT_ID = 'job-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<Job>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#Job');
        const job = await this.getObject<Job>();
        return new BreadcrumbInformation(
            this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${job ? job.Name : ''}`
        );
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.JOB, reload: boolean = false,
        changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadJob(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.JOB, changedProperties)
            );
        }

        return object;
    }

    private async loadJob(changedProperties: string[] = [], cache: boolean = true): Promise<Job> {
        const jobId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Load Job'
            });
        }, 500);

        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, ['ExecPlans', 'Macros']);

        const jobs = await KIXObjectService.loadObjects<Job>(
            KIXObjectType.JOB, [jobId], loadingOptions, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearInterval(timeout);

        let job: Job;
        if (jobs && jobs.length) {
            job = jobs[0];
            this.objectId = job.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return job;
    }
}
