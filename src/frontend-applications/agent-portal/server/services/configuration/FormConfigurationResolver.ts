/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from "../../../model/configuration/FormConfiguration";
import { ModuleConfigurationService } from ".";
import { FormPageConfiguration } from "../../../model/configuration/FormPageConfiguration";
import { FormGroupConfiguration } from "../../../model/configuration/FormGroupConfiguration";
import { FormFieldConfiguration } from "../../../model/configuration/FormFieldConfiguration";
import { LoggingService } from "../../../../../server/services/LoggingService";

export class FormConfigurationResolver {

    public static async resolve(token: string, configuration: FormConfiguration): Promise<FormConfiguration> {
        const pageConfigs = await ModuleConfigurationService.getInstance()
            .loadConfigurations<FormPageConfiguration>(token, configuration.pageConfigurationIds);
        for (const pageId of configuration.pageConfigurationIds) {
            const pageConfig = pageConfigs.find((pc) => pc.id === pageId);

            if (pageConfig) {
                const groupConfigs = await ModuleConfigurationService.getInstance()
                    .loadConfigurations<FormGroupConfiguration>(token, pageConfig.groupConfigurationIds);
                for (const groupId of pageConfig.groupConfigurationIds) {
                    const groupConfig = groupConfigs.find((gc) => gc.id === groupId);
                    if (groupConfig) {
                        const fieldConfigs = await ModuleConfigurationService.getInstance()
                            .loadConfigurations<FormFieldConfiguration>(token, groupConfig.fieldConfigurationIds);
                        for (const fieldId of groupConfig.fieldConfigurationIds) {
                            const fieldConfig = fieldConfigs.find((fc) => fc.id === fieldId);
                            if (fieldConfig) {
                                await this.resolveFieldChildrenConfig(
                                    token, fieldConfig,
                                    [
                                        `group: ${groupId}`, `page: ${pageId}`, `form: ${configuration.id}`
                                    ]
                                );
                                groupConfig.formFields.push(fieldConfig);
                            } else {
                                groupConfig.formFields.push(this.createErrorFormField(fieldId));
                                LoggingService.getInstance().warning(
                                    // tslint:disable-next-line: max-line-length
                                    `Could not resolve form field: ${fieldId} of group: ${groupId} of page: ${pageId} of form: ${configuration.id}`
                                );
                            }
                        }

                        pageConfig.groups.push(groupConfig);
                    } else {
                        LoggingService.getInstance().warning(
                            `Could not resolve form group: ${groupId} of page: ${pageId} of form: ${configuration.id}`
                        );
                    }
                }
            } else {
                LoggingService.getInstance().warning(
                    `Could not resolve form page: ${pageId} of form: ${configuration.id}`
                );
            }

            configuration.pages.push(pageConfig);
        }

        return configuration;
    }

    private static async resolveFieldChildrenConfig(
        token: string, config: FormFieldConfiguration, ancenstorIds: string[]
    ): Promise<void> {
        if (config && config.fieldConfigurationIds) {
            ancenstorIds.unshift(`field: ${config.id}`);

            const fieldConfigs = await ModuleConfigurationService.getInstance()
                .loadConfigurations<FormFieldConfiguration>(token, config.fieldConfigurationIds);

            for (const configId of config.fieldConfigurationIds) {
                const fieldConfig = fieldConfigs.find((fc) => fc.id === configId);
                if (fieldConfig) {
                    if (fieldConfig.fieldConfigurationIds) {
                        await this.resolveFieldChildrenConfig(token, fieldConfig, [...ancenstorIds]);
                    }
                    config.children.push(fieldConfig);
                } else {
                    config.children.push(this.createErrorFormField(configId));
                    LoggingService.getInstance().warning(
                        `Could not resolve form field: ${configId} of ${ancenstorIds.join(' of ')}`
                    );
                }
            }
        }
    }

    private static createErrorFormField(fieldId: string): FormFieldConfiguration {
        return new FormFieldConfiguration(fieldId, 'ERROR: ' + fieldId, null, null);
    }


}
