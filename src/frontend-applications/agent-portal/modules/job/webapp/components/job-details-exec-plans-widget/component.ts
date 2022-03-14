/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { JobDetailsContext, JobFormService } from '../../core';
import { Job } from '../../../model/Job';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ExecPlanTypes } from '../../../model/ExecPlanTypes';
import { ExecPlan } from '../../../model/ExecPlan';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('job-exec-plan-group', WidgetType.GROUP);

        const context = ContextService.getInstance().getActiveContext() as JobDetailsContext;
        if (context) {
            this.state.widgetConfiguration = await context.getWidgetConfiguration(this.state.instanceId);
            this.initWidget(context);

            context.registerListener('jop-exec-plan-widget', {
                sidebarLeftToggled: (): void => { return; },
                filteredObjectListChanged: (): void => { return; },
                objectListChanged: () => { return; },
                sidebarRightToggled: (): void => { return; },
                scrollInformationChanged: () => { return; },
                objectChanged: (id: string | number, job: Job, type: KIXObjectType) => {
                    if (type === KIXObjectType.JOB) {
                        this.initWidget(context);
                    }
                },
                additionalInformationChanged: (): void => { return; }
            });

        }

        this.state.prepared = true;
    }

    private async initWidget(context: JobDetailsContext): Promise<void> {
        const job = await context.getObject<Job>();
        if (job.ExecPlans) {
            const manager = JobFormService.getInstance().getJobFormManager(job.Type);
            if (manager && manager.supportPlan(ExecPlanTypes.TIME_BASED)) {
                const timeExecPlan = job.ExecPlans.find((ep) => ep.Type === ExecPlanTypes.TIME_BASED);
                await this.prepareTimeBasedPlan(timeExecPlan);
                this.state.showTimeBased = true;
            }

            if (manager && manager.supportPlan(ExecPlanTypes.EVENT_BASED)) {
                const eventExecPlan = job.ExecPlans.find((ep) => ep.Type === ExecPlanTypes.EVENT_BASED);
                this.prepareEventBasedPlan(eventExecPlan);
                this.state.showEventBased = true;
            }
        }
    }

    private async prepareTimeBasedPlan(plan: ExecPlan): Promise<void> {
        if (plan && plan.Parameters.Time) {
            this.state.timeLabels = plan.Parameters.Time.map(
                (t) => new Label(null, t, null, DateTimeUtil.getKIXTimeString(new Date(`2000-01-01 ${t}`)))
            );
        }

        if (plan && plan.Parameters.Weekday) {
            this.state.weekdayLabels = [];
            for (const w of plan.Parameters.Weekday) {
                const dayString = await TranslationService.translate(DateTimeUtil.getDayString(w));
                const label = new Label(null, w, null, dayString);
                this.state.weekdayLabels.push(label);
            }
        }
    }

    private prepareEventBasedPlan(plan: ExecPlan): void {
        if (plan && plan.Parameters.Event) {
            this.state.eventLabels = plan.Parameters.Event.map((e) => new Label(null, e, null, e));
        }
    }

    public setGroupMinimizedStates(): void {
        setTimeout(() => {
            const timeGroup = (this as any).getComponent('time-based-group');
            if (timeGroup && (!this.state.timeLabels.length && !this.state.weekdayLabels.length)) {
                timeGroup.setMinizedState(true);
            }

            const eventGroup = (this as any).getComponent('event-based-group');
            if (eventGroup && !this.state.eventLabels.length) {
                eventGroup.setMinizedState(true);
            }
        }, 200);

    }

}

module.exports = Component;
