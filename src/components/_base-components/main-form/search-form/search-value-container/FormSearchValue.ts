import { IdService } from "@kix/core/dist/browser";
import { TreeNode, FilterCriteria, FilterDataType, FilterType } from "@kix/core/dist/model";

export class FormSearchValue {

    public constructor(
        public id: string = IdService.generateDateBasedId('searchValue'),
        public removable: boolean = true,
        public operationNodes: TreeNode[] = [],
        public currentPropertyNode: TreeNode = null,
        public currentOperationNode: TreeNode = null,
        public filterCriteria: FilterCriteria =
            new FilterCriteria(null, null, FilterDataType.STRING, FilterType.AND, null),
    ) { }

}
