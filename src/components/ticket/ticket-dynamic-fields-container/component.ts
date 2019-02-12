import { ComponentState } from './ComponentState';
import {
    WidgetType, KIXObjectType, KIXObjectLoadingOptions, FilterCriteria, FilterDataType,
    FilterType, GeneralCatalogItem, DynamicField
} from '../../../core/model';
import { WidgetService, KIXObjectService, SearchOperator } from '../../../core/browser';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.ticketDynamicFields = input.dynamicFields;
        this.state.ticket = input.ticket;
    }

    public onMount(input: any): void {
        this.setDisplayGroups();
        WidgetService.getInstance().setWidgetType('dynamic-fields-group-widget', WidgetType.GROUP);
    }

    private async setDisplayGroups(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, [
                new FilterCriteria('ObjectType', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Ticket')
            ], null, null, null,
            ['Config']
        );

        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
        );

        this.state.dynamicFields = dynamicFields;

        const loadingOptionsGroups = new KIXObjectLoadingOptions(null, [
            new FilterCriteria(
                'Class', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'DynamicField::DisplayGroup'
            )
        ]);
        const dynamicFieldGroups = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptionsGroups
        );

        this.state.displayGroups = dynamicFieldGroups
            .filter((dfg) => this.getDynamicFields(dfg.ItemID).length);
    }

    private getDynamicFields(groupId: number): DynamicField[] {
        const dynamicFields = this.state.ticketDynamicFields.filter((tdf) => {
            const field = this.state.dynamicFields.find((df) => tdf.ID === df.ID);
            return field && field.DisplayGroupID === groupId;
        });
        return dynamicFields;
    }
}

module.exports = Component;
