/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { AuthenticationSocketClient } from '../../../base-components/webapp/core/AuthenticationSocketClient';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { Role } from '../../../user/model/Role';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { RoleProperty } from '../../../user/model/RoleProperty';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { RoutingService } from '../../../base-components/webapp/core/RoutingService';
import { SetupStepCompletedEventData } from './SetupStepCompletedEventData';

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

    public async registerSetupStep(step: SetupStep): Promise<void> {
        const hasPermissions = await AuthenticationSocketClient.getInstance().checkPermissions(step.permissions);
        if (hasPermissions) {
            this.setupSteps.push(step);
        }
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
            step.result = result;
        }

        await this.saveSetupSteps();
        EventService.getInstance().publish(
            SetupEvent.STEP_COMPLETED, new SetupStepCompletedEventData(stepId, result)
        );
        this.routToInitialContext();
    }

    private routToInitialContext(): void {
        if (!this.setupSteps.some((ss) => !ss.completed && !ss.skipped)) {
            RoutingService.getInstance().routeToInitialContext(false, false);
        }
    }

    public async stepSkipped(stepId: string): Promise<void> {
        const step = this.setupSteps.find((s) => s.id === stepId);
        if (step) {
            step.skipped = true;
        }

        await this.saveSetupSteps();
        EventService.getInstance().publish(SetupEvent.STEP_SKIPPED, { stepId });
        this.routToInitialContext();
    }

    private async saveSetupSteps(): Promise<void> {
        const results = this.setupSteps.map((ss) => new SetupStepResult(ss.id, ss.completed, ss.skipped, ss.result));
        KIXObjectService.updateObject(
            KIXObjectType.SYS_CONFIG_OPTION,
            [[SysConfigOptionProperty.VALUE, JSON.stringify(results)]],
            SysConfigKey.SETUP_ASSISTANT_STATE
        );
    }

    public async isSetupAssitantNeeded(): Promise<boolean> {
        let needSetup = false;
        const currentUser = await AgentService.getInstance().getCurrentUser();
        if (currentUser.UserID === 1) {
            needSetup = true;
        } else {
            const roles = await KIXObjectService.loadObjects<Role>(
                KIXObjectType.ROLE, null, new KIXObjectLoadingOptions([
                    new FilterCriteria(RoleProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Superuser')
                ]));

            if (Array.isArray(roles) && roles.length) {
                const superuserRoleId = roles[0].ID;
                needSetup = currentUser.RoleIDs.some((rid) => rid === superuserRoleId);
            }
        }

        const steps = await this.getSetupSteps();
        needSetup = needSetup && steps.some((s) => !s.completed && !s.skipped);

        return needSetup;
    }

}
