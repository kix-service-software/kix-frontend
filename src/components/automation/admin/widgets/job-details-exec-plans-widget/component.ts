/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, WidgetService, ContextService, Label } from '../../../../../core/browser';
import { WidgetType, Job, DateTimeUtil } from '../../../../../core/model';
import { JobDetailsContext } from '../../../../../core/browser/job';
import { ExecPlan } from '../../../../../core/model/kix/exec-plan';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('job-exec-plan-group', WidgetType.GROUP);

        const context = await ContextService.getInstance().getContext<JobDetailsContext>(JobDetailsContext.CONTEXT_ID);
        if (context) {
            this.state.widgetConfiguration = context.getWidgetConfiguration(this.state.instanceId);

            const job = await context.getObject<Job>();
            if (job.ExecPlans) {
                const timeExecPlan = job.ExecPlans.find((ep) => ep.Type === 'TimeBased');
                await this.prepareTimeBasedPlan(timeExecPlan);

                const eventExecPlan = job.ExecPlans.find((ep) => ep.Type === 'EventBased');
                this.prepareEventBasedPlan(eventExecPlan);
            }

        }

        this.state.prepared = true;
    }

    private async prepareTimeBasedPlan(plan: ExecPlan): Promise<void> {
        if (plan && plan.Parameters.Time) {
            this.state.timeLabels = plan.Parameters.Time.map(
                (t) => new Label(null, t, null, DateTimeUtil.getKIXTimeString(new Date(`2000-01-01 ${t}`)))
            );
        }

        if (plan && plan.Parameters.Weekday) {
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
