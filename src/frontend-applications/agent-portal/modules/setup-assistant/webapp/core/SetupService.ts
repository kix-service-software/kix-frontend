/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SetupStep } from './SetupStep';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { SetupEvent } from './SetupEvent';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SysConfigOptionProperty } from '../../../sysconfig/model/SysConfigOptionProperty';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SetupStepResult } from './SetupStepResult';
import { SetupStepCompletedEventData } from './SetupStepCompletedEventData';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class SetupService {

    private static INSTANCE: SetupService;

    public static getInstance(): SetupService {
        if (!SetupService.INSTANCE) {
            SetupService.INSTANCE = new SetupService();
        }
        return SetupService.INSTANCE;
    }

    private constructor() { }

    private setupSteps: SetupStep[] = [];

    public registerSetupStep(step: SetupStep): void {
        this.setupSteps.push(step);
    }

    public async getSetupSteps(): Promise<SetupStep[]> {
        await this.applySavedSetupSteps();
        return this.setupSteps.sort((a, b) => a.priority - b.priority);
    }

    private async applySavedSetupSteps(): Promise<void> {
        const options = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.SETUP_ASSISTANT_STATE]
        );

        if (options && options.length) {
            const savedSteps: SetupStepResult[] = JSON.parse(options[0].Value);

            this.setupSteps.forEach((ss) => {
                const setupStep = savedSteps.find((s) => s.stepId === ss.id);
                ss.completed = setupStep ? setupStep.completed : false;
                ss.skipped = setupStep ? setupStep.skipped : false;
                ss.result = setupStep ? setupStep.result : null;
            });

        }
    }

    public async stepCompleted(stepId: string, result: any): Promise<void> {
        const step = this.setupSteps.find((s) => s.id === stepId);
        if (step) {
            step.completed = true;
            step.skipped = false;
            step.result = result;
        }

        await this.saveSetupSteps();
        EventService.getInstance().publish(
            SetupEvent.STEP_COMPLETED, new SetupStepCompletedEventData(stepId, result)
        );
        this.closeSetupContext();
    }

    private closeSetupContext(): void {
        if (!this.setupSteps.some((ss) => !ss.completed && !ss.skipped)) {
            ContextService.getInstance().toggleActiveContext();
        }
    }

    public async stepSkipped(stepId: string): Promise<void> {
        const step = this.setupSteps.find((s) => s.id === stepId);
        if (step) {
            step.skipped = true;
        }

        await this.saveSetupSteps();
        EventService.getInstance().publish(SetupEvent.STEP_SKIPPED, { stepId });
        this.closeSetupContext();
    }

    private async saveSetupSteps(): Promise<void> {
        const results = this.setupSteps.map((ss) => new SetupStepResult(ss.id, ss.completed, ss.skipped, ss.result));
        await KIXObjectService.updateObject(
            KIXObjectType.SYS_CONFIG_OPTION,
            [[SysConfigOptionProperty.VALUE, JSON.stringify(results)]],
            SysConfigKey.SETUP_ASSISTANT_STATE
        );
    }

}
