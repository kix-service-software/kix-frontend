/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { IAutofillConfiguration } from '../../../../modules/base-components/webapp/core/IAutofillConfiguration';
import { AuthenticationSocketClient } from '../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { TextModuleProperty } from '../../model/TextModuleProperty';
import { TextModule } from '../../model/TextModule';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { TicketProperty } from '../../../ticket/model/TicketProperty';

export class TextModuleService extends KIXObjectService {

    private static INSTANCE: TextModuleService;

    public static getInstance(): TextModuleService {
        if (!TextModuleService.INSTANCE) {
            TextModuleService.INSTANCE = new TextModuleService();
        }
        return TextModuleService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.TEXT_MODULE);
        this.objectConstructors.set(KIXObjectType.TEXT_MODULE, [TextModule]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TEXT_MODULE;
    }

    public getLinkObjectName(): string {
        return 'TextModule';
    }

    public async getAutoFillConfiguration(textMatch: any, placeholder: string): Promise<IAutofillConfiguration> {
        const allowed = await AuthenticationSocketClient.getInstance().checkPermissions([
            new UIComponentPermission('system/textmodules', [CRUD.READ])
        ]);

        let config: IAutofillConfiguration;

        if (allowed) {
            // tslint:disable:max-line-length
            const itemTemplate
                = '<li data-id="{id}" class="text-module-autofill-item">'
                + '<div class="text-module-info">'
                + '<span class="text-module-name">{Name}</span>'
                + '<span class="text-module-label">{keywordsDisplayString}</span>'
                + '</div>'
                + '</li>';

            const matchCallback = (text: string, offset): { start: number, end: number } => {

                const left = text.slice(0, offset);
                const match = left.match(new RegExp(`${placeholder}[^\\s]*$`));
                if (!match) {
                    return null;
                }

                return {
                    start: match.index, end: offset
                };
            };

            config = {
                textTestCallback: (range): string => {
                    if (!range.collapsed) {
                        return null;
                    }
                    return textMatch.match(range, matchCallback);
                }
                ,
                dataCallback: async (matchInfo, callback): Promise<void> => {
                    const query = matchInfo.query.substring(placeholder.length);
                    const modules = await this.getTextModules(query);
                    modules.forEach((tm) => {
                        tm['id'] = tm.ID;
                        tm['name'] = tm.Name;
                    });
                    callback(modules);
                },
                itemTemplate,
                outputTemplate: '{Text}'
            };
        }

        return config;
    }

    private async getTextModules(query: string): Promise<TextModule[]> {
        let filterCriteria = [];

        if (query && query !== '') {
            filterCriteria.push(
                new FilterCriteria(
                    TextModuleProperty.KEYWORDS, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, query
                ),
                new FilterCriteria(
                    TextModuleProperty.NAME, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, query
                )
            );
        }

        const queueIds = await this.getDependencyIds(TicketProperty.QUEUE_ID);
        if (queueIds?.length) {
            filterCriteria.push(
                new FilterCriteria(
                    TextModuleProperty.QUEUE_IDS, SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, queueIds
                )
            );
        }

        const typeIds = await this.getDependencyIds(TicketProperty.TYPE_ID);
        if (typeIds?.length) {
            filterCriteria.push(
                new FilterCriteria(
                    TextModuleProperty.TICKET_TYPE_IDS, SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, typeIds
                )
            );
        }

        filterCriteria.push(new FilterCriteria(
            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
        ));

        filterCriteria.push(new FilterCriteria(
            'WithDependencies', SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
        ));

        const loadingOptions = new KIXObjectLoadingOptions(filterCriteria, 'TextModule.Name');
        const textModules = await KIXObjectService.loadObjects<TextModule>(
            KIXObjectType.TEXT_MODULE, null, loadingOptions
        );

        return textModules;
    }

    private async getDependencyIds(property: string): Promise<number[]> {
        let ids: number[];
        const context = ContextService.getInstance().getActiveContext();

        if (context?.getFormManager()?.useObjectForms) {
            const formHandler = await context?.getFormManager()?.getObjectFormHandler();
            const value = formHandler?.objectFormValueMapper?.findFormValue(property);
            if (value?.value) {
                ids = Array.isArray(value.value) ? value.value : [value.value];
            }
        } else {
            const formInstance = await context?.getFormManager()?.getFormInstance();
            const value = await formInstance.getFormFieldValueByProperty(property);
            if (value?.value) {
                ids = Array.isArray(value.value) ? value.value : [value.value];
            }
        }

        return ids;
    }
}
