/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { EditSysConfigDialogContext } from '../../core';
import { SysConfigOptionDefinitionProperty } from '../../../model/SysConfigOptionDefinitionProperty';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { SysConfigOptionDefinition } from '../../../model/SysConfigOptionDefinition';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ValidationSeverity } from '../../../../base-components/webapp/core/ValidationSeverity';
import { SysConfigOptionProperty } from '../../../model/SysConfigOptionProperty';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ObjectDialogUtil } from '../../../../base-components/webapp/core/ObjectDialogUtil';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext(EditSysConfigDialogContext.CONTEXT_ID);
        if (context && !context.getObjectId()) {
            this.state.reset = false;
        }
    }

    public async cancel(): Promise<void> {
        ContextService.getInstance().toggleActiveContext();
    }

    public async submit(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            if (context.getObjectId()) {
                ObjectDialogUtil.submit();
            } else {
                const formInstance = await context.getFormManager().getFormInstance();
                const result = await formInstance.validateForm();
                const valid = !result.some((r) => r.severity === ValidationSeverity.ERROR);
                if (valid) {
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
                }
            }
        }
    }
    public async reset(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context.getFormManager().getFormInstance();
        const sysConfigValueField = formInstance.getFormFieldByProperty(SysConfigOptionDefinitionProperty.VALUE);
        const defaultValue = await formInstance.getFormFieldValueByProperty(SysConfigOptionDefinitionProperty.DEFAULT);
        if (sysConfigValueField && defaultValue) {
            formInstance.provideFormFieldValues([[sysConfigValueField.instanceId, defaultValue.value]], null);
        }

        const sysConfigValidField = formInstance.getFormFieldByProperty(KIXObjectProperty.VALID_ID);
        if (sysConfigValidField && context) {
            const sysConfigId = await context.getObjectId();
            const optionDefs = sysConfigId ? await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, [sysConfigId]
            ) : null;
            if (optionDefs && optionDefs[0]) {
                formInstance.provideFormFieldValues(
                    [[sysConfigValidField.instanceId, optionDefs[0].DefaultValidID]], null
                );
            }
        }
    }
}

module.exports = Component;
