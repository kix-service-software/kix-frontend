import { TableExportUtil } from "../../table";
import { FAQCategoryProperty } from "../../../model/kix/faq";
import { CSVExportAction } from "../../actions";

export class FAQCategoryCSVExportAction extends CSVExportAction {

    public async run(): Promise<void> {
        if (this.canRun()) {
            TableExportUtil.export(this.data, [FAQCategoryProperty.FULL_NAME]);
        }
    }

}
