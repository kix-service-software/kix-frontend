/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ModuleConfigurationService } from "./ModuleConfigurationService";
import { ConfigurationType } from "../../core/model/configuration";
import {
    FormConfiguration, FormGroupConfiguration, FormFieldConfiguration
} from "../../core/model/components/form/configuration";
import { LoggingService } from "../../core/services";

export class FormConfigurationResolver {

    public static async resolve(configuration: FormConfiguration): Promise<FormConfiguration> {
        for (const groupId of configuration.groupConfigurations) {
            const groupConfig = await ModuleConfigurationService.getInstance()
                .loadConfiguration<FormGroupConfiguration>(ConfigurationType.FormGroup, groupId);

            for (const fieldId of groupConfig.fieldConfigurations) {
                const fieldConfig = await ModuleConfigurationService.getInstance()
                    .loadConfiguration<FormFieldConfiguration>(ConfigurationType.FormField, fieldId);
                if (fieldConfig) {
                    await this.resolveFieldConfig(fieldConfig);
                    groupConfig.formFields.push(fieldConfig);
                } else {
                    groupConfig.formFields.push(this.createErrorFormField(fieldId));
                    LoggingService.getInstance().warning(
                        `Could not resolve form field: ${fieldId}, group: ${groupId}, form: ${configuration.id}`
                    );
                }
            }

            configuration.groups.push(groupConfig);
        }

        return configuration;
    }

    private static async resolveFieldConfig(config: FormFieldConfiguration): Promise<void> {
        if (config && config.fieldConfigurations) {
            for (const configId of config.fieldConfigurations) {
                const fieldConfig = await ModuleConfigurationService.getInstance()
                    .loadConfiguration<FormFieldConfiguration>(ConfigurationType.FormField, configId);
                if (fieldConfig) {
                    config.children.push(fieldConfig);
                } else {
                    config.children.push(this.createErrorFormField(configId));
                    LoggingService.getInstance().warning(
                        `Could not resolve form field: ${configId}`
                    );
                }
            }
        }
    }

    private static createErrorFormField(fieldId: string): FormFieldConfiguration {
        return new FormFieldConfiguration(fieldId, 'ERROR: ' + fieldId, null, null);
    }


}
