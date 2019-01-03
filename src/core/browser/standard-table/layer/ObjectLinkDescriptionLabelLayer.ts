import { TableRow, TableValue } from "../";
import { CreateLinkDescription, KIXObject, Ticket, TicketProperty } from "../../../model";
import { AbstractTableLayer } from "./AbstractTableLayer";
import { ILinkDescriptionLabelLayer } from "../../ILinkDescriptionLabelLayer";

export class ObjectLinkDescriptionLabelLayer extends AbstractTableLayer implements ILinkDescriptionLabelLayer {

    private linkDescriptions: Array<CreateLinkDescription<KIXObject>> = [];

    public setLinkDescriptions(linkDescriptions: Array<CreateLinkDescription<KIXObject>>): void {
        this.linkDescriptions = linkDescriptions;
    }

    public async getRows(refresh: boolean = false): Promise<Array<TableRow<Ticket>>> {
        const rows = await this.getPreviousLayer().getRows(refresh);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const row = await this.setTableValues(rows[i]);
            result.push(row);
        }
        return result;
    }

    protected async setTableValues(row: TableRow<KIXObject>): Promise<TableRow<KIXObject>> {
        let value = row.values.find((v) => v.columnId === 'LinkedAs');
        if (value) {
            this.setLinkType(row, value);
        } else {
            value = new TableValue('LinkedAs', null, null, [], null);
            row.values.push(value);
            this.setLinkType(row, value);
        }
        return row;
    }

    private setLinkType(row: TableRow<KIXObject>, value: TableValue): void {
        const link = this.linkDescriptions.find(
            (ld) => ld.linkableObject.ObjectId === row.object.ObjectId
                && ld.linkableObject.LinkTypeName === row.object.LinkTypeName
        );
        if (link) {
            value.displayValue = link.linkTypeDescription.asSource
                ? link.linkTypeDescription.linkType.SourceName
                : link.linkTypeDescription.linkType.TargetName;
        } else {
            value.displayValue = '';
        }
    }

}
