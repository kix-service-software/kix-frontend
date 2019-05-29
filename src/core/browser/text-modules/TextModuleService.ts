import { KIXObjectService } from "../kix";
import {
    KIXObjectType, KIXObjectLoadingOptions, FilterCriteria,
    TextModuleProperty, FilterDataType, FilterType, TextModule
} from "../../model";
import { IAutofillConfiguration } from "../components";
import { SearchOperator } from "../SearchOperator";

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

    public getAutoFillConfiguration(textMatch: any, placeholder: string): IAutofillConfiguration {
        // tslint:disable:max-line-length
        const itemTemplate = `<li data-id="{id}" class="text-module-autofill-item"><div class="text-module-category">{Category}</div><div class="text-module-info"><span class="text-module-name">{Name}</span><span class="text-module-label">{Keywords}</span></div></li>`;
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

        const config: IAutofillConfiguration = {
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

        return config;
    }

    private async getTextModules(query: string): Promise<TextModule[]> {
        let filterCriteria = [
            new FilterCriteria(
                TextModuleProperty.AGENT_FRONTEND, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
            )
        ];

        if (query && query !== '') {
            filterCriteria = [
                ...filterCriteria,
                new FilterCriteria(
                    TextModuleProperty.CATEGORY, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, query
                ),
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
