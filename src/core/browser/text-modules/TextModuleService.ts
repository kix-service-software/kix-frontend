import { KIXObjectService } from "../kix";
import {
    KIXObjectType, KIXObjectLoadingOptions, FilterCriteria,
    TextModuleProperty, FilterDataType, FilterType, TextModule, CRUD
} from "../../model";
import { IAutofillConfiguration } from "../components";
import { SearchOperator } from "../SearchOperator";
import { AuthenticationSocketClient } from "../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../model/UIComponentPermission";

export class TextModuleService extends KIXObjectService {

    private static INSTANCE: TextModuleService;

    public static getInstance(): TextModuleService {
        if (!TextModuleService.INSTANCE) {
            TextModuleService.INSTANCE = new TextModuleService();
        }
        return TextModuleService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TEXT_MODULE;
    }

    public getLinkObjectName(): string {
        return 'TextModule';
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case TextModuleProperty.KEYWORDS:
                value = value ? value.split(/[,;\s]\s?/) : undefined;
                break;
            default:
        }
        return [[property, value]];
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
                + '<span class="text-module-label">{Keywords}</span>'
                + '</div>'
                + '</li>';

            const matchCallback = (text: string, offset) => {

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
                textTestCallback: (range) => {
                    if (!range.collapsed) {
                        return null;
                    }
                    return textMatch.match(range, matchCallback);
                }
                ,
                dataCallback: async (matchInfo, callback) => {
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
            filterCriteria = [
                new FilterCriteria(
                    TextModuleProperty.SUBJECT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, query
                ),
                new FilterCriteria(
                    TextModuleProperty.KEYWORDS, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, query
                ),
                new FilterCriteria(
                    TextModuleProperty.NAME, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, query
                )
            ];
        }
        const loadingOptions = new KIXObjectLoadingOptions(null, filterCriteria);
        const textModules = await KIXObjectService.loadObjects<TextModule>(KIXObjectType.TEXT_MODULE, null, loadingOptions);
        return textModules;
    }
}
