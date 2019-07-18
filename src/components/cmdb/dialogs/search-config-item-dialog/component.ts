/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { FormService, AbstractMarkoComponent } from "../../../../core/browser";
import { DialogService } from "../../../../core/browser/components/dialog";
import { KIXObjectType, FormContext } from "../../../../core/model";

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.formId = await FormService.getInstance().getFormIdByContext(
            FormContext.SEARCH, KIXObjectType.CONFIG_ITEM
        );
        DialogService.getInstance().setMainDialogHint('Translatable#The search only includes current versions.');
    }

    public async cancel(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.reset();
        DialogService.getInstance().closeMainDialog();
    }

}

module.exports = Component;
