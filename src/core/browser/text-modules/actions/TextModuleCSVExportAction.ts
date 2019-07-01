import { TableExportUtil } from "../../table";
import { CSVExportAction } from "../../actions";
import { TextModuleProperty } from "../../../model";

export class TextModuleCSVExportAction extends CSVExportAction {

    public async run(): Promise<void> {
        if (this.canRun()) {
            TableExportUtil.export(this.data, [TextModuleProperty.TEXT]);
        }
    }

}
