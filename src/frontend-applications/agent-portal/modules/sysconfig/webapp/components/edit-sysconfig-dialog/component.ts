/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractEditDialog } from "../../../../../modules/base-components/webapp/core/AbstractEditDialog";
import { ComponentState } from "./ComponentState";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { EditSysConfigDialogContext } from "../../core";
import { FormService } from "../../../../../modules/base-components/webapp/core/FormService";
import { SysConfigOptionDefinitionProperty } from "../../../model/SysConfigOptionDefinitionProperty";

class Component extends AbstractEditDialog {

    private formId: string;

    public onInput(input: any) {
        this.formId = input.formId;
    }

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update Key',
            undefined,
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
            EditSysConfigDialogContext.CONTEXT_ID
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
        this.objectType = KIXObjectType.SYS_CONFIG_OPTION;
        await super.submit();
    }

    public async reset(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const sysConfigField = await formInstance.getFormFieldByProperty(SysConfigOptionDefinitionProperty.VALUE);
        const defaultValue = await formInstance.getFormFieldValueByProperty(SysConfigOptionDefinitionProperty.DEFAULT);
        if (sysConfigField) {
            const formFieldInstanceID = sysConfigField.instanceId;
            formInstance.provideFormFieldValue(formFieldInstanceID, defaultValue.value);
        }
    }

}

module.exports = Component;
