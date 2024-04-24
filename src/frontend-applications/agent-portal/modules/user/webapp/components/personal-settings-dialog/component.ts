/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Error } from '../../../../../../../server/model/Error';
import { ContextMode } from '../../../../../model/ContextMode';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { ValidationResult } from '../../../../../modules/base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { SearchSocketClient } from '../../../../search/webapp/core';
import { PersonalSetting } from '../../../model/PersonalSetting';
import { AgentService } from '../../core/AgentService';
import { ComponentState } from './ComponentState';


class Component {

    private state: ComponentState;
    private searchObject: KIXObjectType | string;

    public async onCreate(input: any): Promise<void> {
        this.state = new ComponentState(input.instanceId);
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject(
            ['Translatable#Cancel', 'Translatable#Save', 'Translatable#Reset Search To Default']
        );

        await this.prepareForm();

        const context = ContextService.getInstance().getActiveContext();
        context.getFormManager().setFormId('personal-settings');

        this.state.loading = false;
    }

    private async prepareForm(): Promise<void> {
        const personalSettings: PersonalSetting[] = await AgentService.getInstance().getPersonalSettings();

        const formGroups: FormGroupConfiguration[] = [];
        personalSettings.forEach((ps) => {
            const group = formGroups.find((g) => g.name === ps.group);
            const formField = new FormFieldConfiguration(
                ps.property,
                ps.label, ps.property, ps.inputComponent, !!ps.required, ps.hint,
                ps.options, ps.defaultValue
            );
            if (group) {
                group.formFields.push(formField);
            } else {
                formGroups.push(new FormGroupConfiguration(ps.property, ps.group, [], null, [formField]));
            }
        });

        const formName = await TranslationService.translate('Translatable#Personal Settings');
        const form = new FormConfiguration(
            'personal-settings', formName,
            [], KIXObjectType.PERSONAL_SETTINGS, true, FormContext.EDIT, null,
            [
                new FormPageConfiguration(
                    'personal-settings-form-page', 'Translatable#Personal Settings',
                    [], null, true, formGroups
                )
            ]
        );

        await FormService.getInstance().addForm(form);
    }

    public cancel(): void {
        ContextService.getInstance().toggleActiveContext();
    }

    public async submit(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            this.showValidationError(result);
        } else {
            const loadingHint = await TranslationService.translate('Translatable#Save Settings');
            BrowserUtil.toggleLoadingShield('PERSONAL_SETTINGS_SHIELD', true, loadingHint);
            await AgentService.getInstance().setPreferencesByForm()
                .then(async () => {
                    TranslationService.getInstance().resetTranslations();
                    EventService.getInstance().publish('USER_LANGUAGE_CHANGED');
                    setTimeout(async () => {
                        BrowserUtil.toggleLoadingShield('PERSONAL_SETTINGS_SHIELD', false);
                        await ContextService.getInstance().toggleActiveContext(null, null, true);
                        EventService.getInstance().publish(ApplicationEvent.REFRESH);
                        const toast = await TranslationService.translate('Translatable#Changes saved.');
                        BrowserUtil.openSuccessOverlay(toast);
                    }, 100);
                }).catch((error: Error) => {
                    BrowserUtil.toggleLoadingShield('PERSONAL_SETTINGS_SHIELD', false);
                    BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                });
        }
    }

    public async showValidationError(result: ValidationResult[]): Promise<void> {
        const errorMessages = [];

        result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message).forEach((m) => {
            if (!errorMessages.some((em) => em === m)) {
                errorMessages.push(m);
            }
        });

        const title = await TranslationService.translate('Translatable#Error on form validation:');
        const content = new ComponentContent('list-with-title',
            {
                title,
                list: errorMessages
            }
        );

        const toastTitle = await TranslationService.translate('Translatable#Validation error');
        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, toastTitle, null, true
        );
    }

    public async loadSearchObjectNodes(): Promise<TreeNode[]> {
        const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        const objectTypes = descriptors
            .map((d) => d.kixObjectTypes?.length ? d.kixObjectTypes[0] : null)
            .filter((o) => o);

        const nodes: TreeNode[] = [];
        for (const ot of objectTypes) {
            const objectName = await LabelService.getInstance().getObjectName(ot, true);
            const icon = await LabelService.getInstance().getObjectIconForType(ot);
            nodes.push(new TreeNode(ot, objectName, icon));
        }
        return nodes;
    }

    public searchObjectChanged(nodes: TreeNode[]): void {
        this.searchObject = nodes?.length ? nodes[0].id : null;
    }

    public async resetSearchDefaults(): Promise<void> {
        await SearchSocketClient.getInstance().deleteUserDefaultSearch(this.searchObject);
        const message = await TranslationService.translate(
            'Translatable#Search defaults for {0} reseted.', [this.searchObject]
        );
        BrowserUtil.openSuccessOverlay(message);
    }
}

module.exports = Component;
