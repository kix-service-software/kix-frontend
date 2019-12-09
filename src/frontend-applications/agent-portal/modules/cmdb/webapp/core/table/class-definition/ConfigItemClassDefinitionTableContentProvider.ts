/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../../base-components/webapp/core/table/TableContentProvider";
import { ConfigItemClassDefinition } from "../../../../model/ConfigItemClassDefinition";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../../model/kix/KIXObjectType";
import { TranslationService } from "../../../../../../modules/translation/webapp/core/TranslationService";
import { ContextService } from "../../../../../../modules/base-components/webapp/core/ContextService";
import { ConfigItemClassDetailsContext } from "../..";
import { ConfigItemClass } from "../../../../model/ConfigItemClass";
import { ConfigItemClassDefinitionProperty } from "../../../../model/ConfigItemClassDefinitionProperty";

export class ConfigItemClassDefinitionTableContentProvider extends TableContentProvider<ConfigItemClassDefinition> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<ConfigItemClassDefinition>>> {
        let rowObjects = [];

        const isCurrentText = await TranslationService.translate('Translatable#(Current definition)');

        const context = await ContextService.getInstance().getContext(ConfigItemClassDetailsContext.CONTEXT_ID);
        const configItemClass = await context.getObject<ConfigItemClass>();
        if (configItemClass && configItemClass.Definitions && !!configItemClass.Definitions.length) {
            rowObjects = configItemClass.Definitions.map((d) => {
                const values: TableValue[] = [];

                for (const property in d) {
                    if (d.hasOwnProperty(property)) {
                        values.push(new TableValue(property, d[property]));
                    }
                }

                values.push(
                    new TableValue(
                        ConfigItemClassDefinitionProperty.CURRENT, d.isCurrentDefinition,
                        d.isCurrentDefinition ? isCurrentText : ''
                    )
                );

                return new RowObject<ConfigItemClassDefinition>(values, d);
            });
        }

        return rowObjects;
    }

}
