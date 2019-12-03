/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, ContextMode, JobProperty } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";
import { JobDetailsContext } from "../../../../../core/browser/job";
import { RoutingConfiguration } from "../../../../../core/browser/router";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Job',
            'Translatable#Job successfully created.',
            KIXObjectType.JOB,
            new RoutingConfiguration(
                JobDetailsContext.CONTEXT_ID, KIXObjectType.JOB,
                ContextMode.DETAILS, JobProperty.ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

}

module.exports = Component;
