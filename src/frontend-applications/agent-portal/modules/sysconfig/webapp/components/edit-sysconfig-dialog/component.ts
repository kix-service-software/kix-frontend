/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { EventService } from "../../../../base-components/webapp/core/EventService";
import { SysconfigEvent } from "../../core/SysconfigEvent";
import { DialogService } from "../../../../base-components/webapp/core/DialogService";
import { BrowserUtil } from "../../../../base-components/webapp/core/BrowserUtil";
import { KIXObjectProperty } from "../../../../../model/kix/KIXObjectProperty";
import { ContextService } from "../../../../base-components/webapp/core/ContextService";
import { SysConfigOptionDefinition } from "../../../model/SysConfigOptionDefinition";
import { KIXObjectService } from "../../../../base-components/webapp/core/KIXObjectService";
import { ValidationSeverity } from "../../../../base-components/webapp/core/ValidationSeverity";
import { SysConfigOptionProperty } from "../../../model/SysConfigOptionProperty";

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
        const context = await ContextService.getInstance().getContext(EditSysConfigDialogContext.CONTEXT_ID);
        if (context) {
            if (!context.getObjectId()) {
                this.state.reset = false;
            }
        }
        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        const context = await ContextService.getInstance().getContext(EditSysConfigDialogContext.CONTEXT_ID);
        if (context) {
            if (context.getObjectId()) {
                this.objectType = KIXObjectType.SYS_CONFIG_OPTION;
                await super.submit();
            } else {
                const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
                const result = await formInstance.validateForm();
                const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
                if (validationError) {
                    if (this.showValidationError) {
                        this.showValidationError(result);
                    } else {
                        super.showValidationError.call(this, result);
                    }

                    ContextService.getInstance().updateObjectLists(this.objectType);

                } else {
                    DialogService.getInstance().setMainDialogLoading(true, this.loadingHint);
                    const updateObjects: Map<string, any> = new Map();
                    for (const p of formInstance.getForm().pages) {
                        for (const f of p.groups[0].formFields) {
                            if (f.property === SysConfigOptionDefinitionProperty.DEFAULT) {
                                continue;
                            }

                            const option = f.options.find((o) => o.option === 'SYSCONFIG_NAME');
                            if (!updateObjects.has(option.value)) {
                                updateObjects.set(option.value, {});
                            }

                            const key = updateObjects.get(option.value);
                            const value = formInstance.getFormFieldValue(f.instanceId);
                            key[f.property] = value.value;
                        }
                    }

                    const updatePromises = [];
                    updateObjects.forEach((value, key) => {
                        updatePromises.push(
                            KIXObjectService.updateObject(KIXObjectType.SYS_CONFIG_OPTION,
                                [
                                    [SysConfigOptionProperty.VALUE, value[SysConfigOptionDefinitionProperty.VALUE]],
                                    [KIXObjectProperty.VALID_ID, value[KIXObjectProperty.VALID_ID]]
                                ], key, false)
                        );
                    });

                    await Promise.all(updatePromises);
                    await this.handleDialogSuccess(null);
                }
            }
        }
    }
    public async reset(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const sysConfigValueField = await formInstance.getFormFieldByProperty(SysConfigOptionDefinitionProperty.VALUE);
        const defaultValue = await formInstance.getFormFieldValueByProperty(SysConfigOptionDefinitionProperty.DEFAULT);
        if (sysConfigValueField && defaultValue) {
            formInstance.provideFormFieldValue(sysConfigValueField.instanceId, defaultValue.value);
        }

        const sysConfigValidField = await formInstance.getFormFieldByProperty(KIXObjectProperty.VALID_ID);
        const context = ContextService.getInstance().getActiveContext();
        if (sysConfigValidField && context) {
            const sysConfigId = await context.getObjectId();
            const optionDefs = sysConfigId ? await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, [sysConfigId]
            ) : null;
            if (optionDefs && optionDefs[0]) {
                formInstance.provideFormFieldValue(sysConfigValidField.instanceId, optionDefs[0].DefaultValidID);
            }
        }
    }

    protected async handleDialogSuccess(objectId: string | number): Promise<void> {
        EventService.getInstance().publish(SysconfigEvent.SYSCONFIG_OPTIONS_UPDATED);

        DialogService.getInstance().setMainDialogLoading(false);
        DialogService.getInstance().submitMainDialog();
        FormService.getInstance().deleteFormInstance(this.state.formId);
        BrowserUtil.openSuccessOverlay(this.successHint);
    }

}

module.exports = Component;
