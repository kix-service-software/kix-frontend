/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from "../../../model/configuration/FormConfiguration";
import { FormPageConfiguration } from "../../../model/configuration/FormPageConfiguration";
import { FormGroupConfiguration } from "../../../model/configuration/FormGroupConfiguration";
import { FormFieldConfiguration } from "../../../model/configuration/FormFieldConfiguration";
import { ResolverUtil } from "./ResolverUtil";

export class FormConfigurationResolver {

    public static async resolve(token: string, configuration: FormConfiguration): Promise<FormConfiguration> {
        configuration.pages = await ResolverUtil.loadConfigurations<FormPageConfiguration>(
            token, configuration.pageConfigurationIds, configuration.pages
        );
        for (const pageConfig of configuration.pages) {
            pageConfig.groups = await ResolverUtil.loadConfigurations<FormGroupConfiguration>(
                token, pageConfig.groupConfigurationIds, pageConfig.groups
            );
            for (const groupConfig of pageConfig.groups) {
                groupConfig.formFields = await ResolverUtil.loadConfigurations<FormFieldConfiguration>(
                    token, groupConfig.fieldConfigurationIds, groupConfig.formFields
                );
                for (const fieldConfig of groupConfig.formFields) {
                    await this.resolveFieldChildrenConfig(
                        token, fieldConfig,
                        [
                            `group: ${groupConfig.id}`, `page: ${pageConfig.id}`, `form: ${configuration.id}`
                        ]
                    );
                }
            }

        }

        return configuration;
    }

    private static async resolveFieldChildrenConfig(
        token: string, config: FormFieldConfiguration, ancenstorIds: string[]
    ): Promise<void> {
        if (config && (config.fieldConfigurationIds || config.children)) {
            ancenstorIds.unshift(`field: ${config.id}`);

            config.children = await ResolverUtil.loadConfigurations<FormFieldConfiguration>(
                token, config.fieldConfigurationIds, config.children
            );

            for (const fieldConfig of config.children) {
                if (fieldConfig.fieldConfigurationIds || fieldConfig.children) {
                    await this.resolveFieldChildrenConfig(token, fieldConfig, [...ancenstorIds]);
                }
            }
        }
    }

}
