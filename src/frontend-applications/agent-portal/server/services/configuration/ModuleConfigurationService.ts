/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LoggingService } from '../../../../../server/services/LoggingService';
import { SysConfigService } from '../../../modules/sysconfig/server/SysConfigService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { IConfiguration } from '../../../model/configuration/IConfiguration';
import { CacheService } from '../cache';
import { SysConfigOption } from '../../../modules/sysconfig/model/SysConfigOption';
import { ConfigurationType } from '../../../model/configuration/ConfigurationType';
import { SysConfigOptionDefinition } from '../../../modules/sysconfig/model/SysConfigOptionDefinition';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { SysConfigOptionDefinitionProperty } from '../../../modules/sysconfig/model/SysConfigOptionDefinitionProperty';
import { FilterType } from '../../../model/FilterType';
import { FilterDataType } from '../../../model/FilterDataType';
import { Error } from '../../../../../server/model/Error';
import { SearchOperator } from '../../../modules/search/model/SearchOperator';
import { FormContext } from '../../../model/configuration/FormContext';
import { FormConfiguration } from '../../../model/configuration/FormConfiguration';
import { SysConfigAccessLevel } from '../../../modules/sysconfig/model/SysConfigAccessLevel';
import { SysConfigOptionProperty } from '../../../modules/sysconfig/model/SysConfigOptionProperty';

export class ModuleConfigurationService {

    private static INSTANCE: ModuleConfigurationService;

    public static getInstance(): ModuleConfigurationService {
        if (!ModuleConfigurationService.INSTANCE) {
            ModuleConfigurationService.INSTANCE = new ModuleConfigurationService();
        }
        return ModuleConfigurationService.INSTANCE;
    }

    private constructor() { }

    private forms: string[] = [];
    private formIDsWithContext: Array<[FormContext, KIXObjectType | string, string]> = [];

    public async saveConfiguration(
        token: string, configuration: IConfiguration, accessLevel: SysConfigAccessLevel = SysConfigAccessLevel.INTERNAL
    ): Promise<void> {
        this.validate(configuration);
        const config = await this.loadConfiguration(token, configuration.id)
            .catch((error) => {
                return null;
            });

        if (config) {
            await this.updateConfiguration(token, configuration, accessLevel);
        } else {
            await this.createConfiguration(token, configuration, accessLevel);
        }

        await CacheService.getInstance().deleteKeys('ModuleConfigurationService');
    }

    public async loadConfiguration<T extends IConfiguration>(token: string, id: string): Promise<T> {
        let configuration: T;

        const options = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            token, 'ModuleConfigurationService::SysConfigOption', KIXObjectType.SYS_CONFIG_OPTION, [id], null, null
        ).catch(() => []);

        if (options && options.length && options[0].Value) {
            configuration = JSON.parse(options[0].Value);
        }

        return configuration;
    }

    public async loadConfigurations<T extends IConfiguration>(token: string, ids: string[]): Promise<T[]> {
        const options = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            token, 'ModuleConfigurationService::SysConfigOption', KIXObjectType.SYS_CONFIG_OPTION, null,
            new KIXObjectLoadingOptions([
                new FilterCriteria(
                    SysConfigOptionProperty.NAME, SearchOperator.IN, FilterDataType.STRING, FilterType.OR,
                    ids
                )
            ]), null
        ).catch((): SysConfigOption[] => []);

        const configurations = options.filter((o) => o.Value).map((o) => JSON.parse(o.Value));
        return configurations;
    }

    private async updateConfiguration(
        token: string, configuration: IConfiguration, accessLevel: SysConfigAccessLevel = SysConfigAccessLevel.INTERNAL
    ): Promise<void> {
        LoggingService.getInstance().info(`Update existing configuration: ${configuration.id}`);
        const name = configuration.name ? configuration.name : configuration.id;
        await SysConfigService.getInstance().updateObject(
            token, 'ModuleConfigurationService', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
            [
                [SysConfigOptionDefinitionProperty.ACCESS_LEVEL, accessLevel],
                [SysConfigOptionDefinitionProperty.NAME, configuration.id],
                [SysConfigOptionDefinitionProperty.DESCRIPTION, name],
                [SysConfigOptionDefinitionProperty.DEFAULT, JSON.stringify(configuration)],
                [SysConfigOptionDefinitionProperty.CONTEXT, 'kix18-web-frontend'],
                [SysConfigOptionDefinitionProperty.CONTEXT_METADATA, configuration.type],
                [SysConfigOptionDefinitionProperty.TYPE, 'String']
            ],
            configuration.id
        ).catch((error: Error) => LoggingService.getInstance().error(error.Code, error));
    }

    private async createConfiguration(
        token: string, configuration: IConfiguration, accessLevel: SysConfigAccessLevel = SysConfigAccessLevel.INTERNAL
    ): Promise<void> {
        LoggingService.getInstance().info(`Create new configuration: ${configuration.id}`);
        const name = configuration.name ? configuration.name : configuration.id;
        await SysConfigService.getInstance().createObject(
            token, 'ModuleConfigurationService', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
            [
                [SysConfigOptionDefinitionProperty.ACCESS_LEVEL, accessLevel],
                [SysConfigOptionDefinitionProperty.NAME, configuration.id],
                [SysConfigOptionDefinitionProperty.DESCRIPTION, name],
                [SysConfigOptionDefinitionProperty.DEFAULT, JSON.stringify(configuration)],
                [SysConfigOptionDefinitionProperty.CONTEXT, 'kix18-web-frontend'],
                [SysConfigOptionDefinitionProperty.CONTEXT_METADATA, configuration.type],
                [SysConfigOptionDefinitionProperty.TYPE, 'String'],
                [SysConfigOptionDefinitionProperty.IS_REQUIRED, 0]
            ], null, null
        ).catch((error: Error) => LoggingService.getInstance().error(error.Code, error));
    }

    private validate(configuration: IConfiguration): void {
        if (!configuration.id) {
            throw new Error('-1', 'Missing required property id.');
        }

        if (!configuration.type) {
            throw new Error('-1', 'Missing required property type.');
        }
    }

    public async sysconfigChanged(id: string): Promise<void> {
        await CacheService.getInstance().deleteKeys('ModuleConfigurationService');
    }

    public registerFormId(formId: string): void {
        if (!this.forms.some((fid) => fid === formId)) {
            this.forms.push(formId);
        }
    }

    public registerForm(formContext: FormContext[], formObject: KIXObjectType | string, formId: string): void {
        if (!this.forms.some((fid) => fid === formId)) {
            this.forms.push(formId);
        }

        formContext.forEach((fc) => {
            const fcIndex = this.formIDsWithContext.findIndex((fidwc) => fidwc[0] === fc && fidwc[1] === formObject);
            if (fcIndex === -1) {
                this.formIDsWithContext.push([fc, formObject, formId]);
            } else if (this.formIDsWithContext[fcIndex][2] !== formId) {
                LoggingService.getInstance().warning('A form replaces another form for specific context', {
                    'new form id': formId,
                    'old form id': this.formIDsWithContext[fcIndex][2],
                    'context': fc,
                    'object': formObject
                });
                this.formIDsWithContext[fcIndex] = [fc, formObject, formId];
            }
        });
    }

    public getRegisteredForms(token: string): FormConfiguration[] {
        const result = [];
        for (const formId of this.forms) {
            const form = this.loadConfiguration(token, formId);
            if (form) {
                result.push(form);
            }
        }

        return result;
    }

    public getFormIDsWithContext(): Array<[FormContext, KIXObjectType | string, string]> {
        return this.formIDsWithContext;
    }

    public async cleanUp(token: string): Promise<void> {
        LoggingService.getInstance().info('Cleanup configurations');
        const definitions = await this.loadSysconfigDefinitions(token);
        await SysConfigService.getInstance().deleteObjects(
            token, 'ModuleConfigurationService', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
            definitions.map((d) => d.Name)
        );
    }

    private async loadSysconfigDefinitions(
        token: string, type?: string | ConfigurationType
    ): Promise<SysConfigOptionDefinition[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                SysConfigOptionDefinitionProperty.CONTEXT, SearchOperator.EQUALS,
                FilterDataType.STRING, FilterType.AND, 'kix18-web-fontend'
            )
        ]);

        if (type) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.CONTEXT_METADATA, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, type
                )
            );
        }

        const definitions = await SysConfigService.getInstance().loadObjects<SysConfigOptionDefinition>(
            token, 'ModuleConfigurationService', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, null, loadingOptions, null
        );

        return definitions;
    }


}
