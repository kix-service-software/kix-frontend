/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { DialogService } from '../../../../../modules/base-components/webapp/core/DialogService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { ValidationSeverity } from '../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { CMDBService, ConfigItemDetailsContext } from '../../core';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { ConfigItem } from '../../../model/ConfigItem';
import { ConfigItemProperty } from '../../../model/ConfigItemProperty';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { ValidationResult } from '../../../../../modules/base-components/webapp/core/ValidationResult';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { StringContent } from '../../../../../modules/base-components/webapp/core/StringContent';
import { AbstractEditDialog } from '../../../../base-components/webapp/core/AbstractEditDialog';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';

class Component extends AbstractEditDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update Config Item',
            undefined,
            KIXObjectType.CONFIG_ITEM,
            ConfigItemDetailsContext.CONTEXT_ID
        );
    }

    public async onMount(): Promise<void> {
        super.onMount();
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
    }

    public async cancel(): Promise<void> {
        super.cancel();
    }

    public async submit(): Promise<void> {
        setTimeout(async () => {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            if (formInstance) {
                const result = await formInstance.validateForm();
                const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
                if (validationError) {
                    this.showValidationError(result);
                } else {
                    BrowserUtil.toggleLoadingShield(true, 'Translatable#Update Config Item');
                    const cmdbService = ServiceRegistry.getServiceInstance<CMDBService>(KIXObjectType.CONFIG_ITEM);
                    const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
                    if (cmdbService && context) {
                        const configItem = await context.getObject<ConfigItem>(KIXObjectType.CONFIG_ITEM, true);
                        const versionId = await cmdbService.createConfigItemVersion(
                            this.state.formId, Number(context.getObjectId())
                        );
                        BrowserUtil.toggleLoadingShield(false);
                        if (versionId) {
                            const updatedConfigItem = await context.getObject<ConfigItem>(
                                KIXObjectType.CONFIG_ITEM, true,
                                [ConfigItemProperty.VERSIONS, ConfigItemProperty.CURRENT_VERSION]
                            );

                            const toast = await TranslationService.translate('Translatable#Changes saved.');

                            const hint = configItem.CurrentVersion
                                && configItem.CurrentVersion.equals(updatedConfigItem.CurrentVersion)
                                ? toast : 'Translatable#New Version created';
                            BrowserUtil.openSuccessOverlay(hint);

                            EventService.getInstance().publish(
                                ApplicationEvent.OBJECT_UPDATED, { objectType: this.objectType }
                            );

                            DialogService.getInstance().submitMainDialog();
                        }
                    }
                }
            }
        }, 300);
    }

    public showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Translatable#Error on form validation:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Translatable#Validation error', null, true
        );
    }

    public showError(error: any): void {
        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, new StringContent(error), 'Translatable#Error!', null, true
        );
    }

}

module.exports = Component;
