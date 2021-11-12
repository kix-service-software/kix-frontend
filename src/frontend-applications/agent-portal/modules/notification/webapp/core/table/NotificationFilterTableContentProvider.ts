/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { NotificationFilterTableProperty } from './NotificationFilterTableProperty';
import { TableContentProvider } from '../../../../base-components/webapp/core/table/TableContentProvider';
import { Table, RowObject, TableValue } from '../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { Notification } from '../../../model/Notification';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { SearchDefinition, SearchOperatorUtil } from '../../../../search/webapp/core';
import { ArticleProperty } from '../../../../ticket/model/ArticleProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';

export class NotificationFilterTableContentProvider extends TableContentProvider<any> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.NOTIFICATION, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<RowObject[]> {
        const context = ContextService.getInstance().getActiveContext();
        const notification = context ? await context.getObject<Notification>() : null;
        const relativeDateTimeOperators = SearchDefinition.getRelativeDateTimeOperators();

        const rowObjects: RowObject[] = [];
        if (notification && notification.Filter) {
            for (const filter in notification.Filter) {
                if (notification.Filter[filter] && Array.isArray(notification.Filter[filter])) {
                    for (const criterion of notification.Filter[filter]) {
                        let displayKey = criterion.Field;
                        let displayValuesAndIcons = [];
                        if (KIXObjectService.getDynamicFieldName(displayKey)) {
                            displayValuesAndIcons = await this.getDFValues(
                                displayKey, criterion.Value, KIXObjectType.TICKET
                            );
                            displayKey = await LabelService.getInstance().getPropertyText(
                                displayKey, KIXObjectType.TICKET
                            );
                        } else {
                            const isTranslatable = relativeDateTimeOperators.includes(
                                criterion.Operator as SearchOperator) ? false : true;
                            const isArticleProperty = this.isArticleProperty(displayKey);
                            displayValuesAndIcons = await this.getValue(
                                displayKey, criterion.Value,
                                isArticleProperty ? KIXObjectType.ARTICLE : KIXObjectType.TICKET, isTranslatable
                            );
                            displayKey = await LabelService.getInstance().getPropertyText(
                                displayKey, isArticleProperty ? KIXObjectType.ARTICLE : KIXObjectType.TICKET
                            );
                        }

                        const displayString = Array.isArray(displayValuesAndIcons[0])
                            ? displayValuesAndIcons[0].join(', ')
                            : '';

                        const operatorLabel = await SearchOperatorUtil.getText(criterion.Operator);

                        const values: TableValue[] = [
                            new TableValue(NotificationFilterTableProperty.FIELD, criterion.Field, displayKey),
                            new TableValue(NotificationFilterTableProperty.OPERATOR, criterion.Operator, operatorLabel),
                            new TableValue(
                                NotificationFilterTableProperty.VALUE,
                                displayValuesAndIcons[0],
                                displayString,
                                null, displayValuesAndIcons[1]
                            )
                        ];
                        rowObjects.push(new RowObject<any>(values));
                    }
                }
            }
        }

        return rowObjects;
    }

    private async getValue(
        property: string, value: string | number | string[] | number[], objectType: KIXObjectType | string,
        translatable: boolean = true
    ): Promise<[string[], Array<string | ObjectIcon>]> {
        const displayValues: string[] = [];
        const displayIcons: Array<string | ObjectIcon> = [];
        if (Array.isArray(value)) {
            for (const v of value) {
                const string = await LabelService.getInstance().getPropertyValueDisplayText(objectType, property, v,
                    translatable);
                if (string) {
                    displayValues.push(string);
                    const icons = await LabelService.getInstance().getIconsForType(objectType, null, property, v);
                    if (icons && !!icons.length) {
                        displayIcons.push(icons[0]);
                    } else {
                        displayIcons.push(null);
                    }
                }
            }
        } else {
            displayValues.push(
                await LabelService.getInstance().getPropertyValueDisplayText(
                    objectType, property, isNaN(Number(value)) ? value : Number(value), translatable
                )
            );
            const icons = await LabelService.getInstance().getIconsForType(objectType, null, property, value);
            if (icons && !!icons.length) {
                displayIcons.push(icons[0]);
            } else {
                displayIcons.push(null);
            }
        }
        return [displayValues, displayIcons];
    }

    private async getDFValues(
        key: string, value: any, objectType: KIXObjectType | string
    ): Promise<[string[], Array<string | ObjectIcon>, string]> {
        const dfName = key.replace(new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`), '$1');
        let displayValues: string[] = [];
        let displayString: string = '';
        if (dfName) {
            const preparedValue = await LabelService.getInstance().getDFDisplayValues(
                objectType,
                new DynamicFieldValue({
                    Name: dfName,
                    Value: value
                } as DynamicFieldValue)
            );
            displayValues = preparedValue ? preparedValue[0] : Array.isArray(value) ? value : [value];
            displayString = preparedValue ? preparedValue[1] : '';
        }
        return [displayValues, null, displayString];
    }

    private isArticleProperty(property: string): boolean {
        const articleProperty = Object.keys(ArticleProperty).map((p) => ArticleProperty[p]);
        return property === 'ID' || articleProperty.some((p) => p === property);
    }
}
