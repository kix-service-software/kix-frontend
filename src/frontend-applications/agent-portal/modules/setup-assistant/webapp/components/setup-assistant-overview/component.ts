/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { SetupService } from '../../core/SetupService';
import { SetupStep } from '../../core/SetupStep';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { SetupEvent } from '../../core/SetupEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.setupSteps = await SetupService.getInstance().getSetupSteps();

        if (Array.isArray(this.state.setupSteps) && this.state.setupSteps.length) {
            for (const step of this.state.setupSteps) {
                if (!step.completed && !step.skipped) {
                    this.stepClicked(step);
                    break;
                }
            }
        }

        this.subscriber = {
            eventSubscriberId: 'SetupOverviewSteps',
            eventPublished: (data: any, eventId: string): void => {
                if (data.stepId) {
                    const index = this.state.setupSteps.findIndex((s) => s.id === data.stepId);
                    if (index !== -1 && index < this.state.setupSteps.length - 1) {
                        let found = false;
                        for (let i = index; i < this.state.setupSteps.length; i++) {
                            const step = this.state.setupSteps[i];
                            if (!step.completed && !step.skipped) {
                                this.stepClicked(this.state.setupSteps[i]);
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            const openIdx = this.state.setupSteps.findIndex((ss) => !ss.completed && !ss.skipped);
                            if (openIdx !== -1) {
                                this.stepClicked(this.state.setupSteps[openIdx]);
                            }
                        }
                    }
                }
            }
        };

        EventService.getInstance().subscribe(SetupEvent.STEP_COMPLETED, this.subscriber);
        EventService.getInstance().subscribe(SetupEvent.STEP_SKIPPED, this.subscriber);

        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(SetupEvent.STEP_COMPLETED, this.subscriber);
        EventService.getInstance().unsubscribe(SetupEvent.STEP_SKIPPED, this.subscriber);
    }

    public stepClicked(step: SetupStep): void {
        this.state.activeStep = step;
        this.state.template = KIXModulesService.getComponentTemplate(step.componentId);
    }

}

module.exports = Component;
