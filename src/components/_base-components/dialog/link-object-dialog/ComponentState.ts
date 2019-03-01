import { KIXObject, LinkTypeDescription, CreateLinkDescription, TreeNode, KIXObjectType } from "../../../../core/model";
import { ITable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public linkableObjectNodes: TreeNode[] = [],
        public currentLinkableObjectNode: TreeNode = null,
        public table: ITable = null,
        public resultCount: number = 0,
        public linkTypeNodes: TreeNode[] = [],
        public currentLinkTypeNode: TreeNode = null,
        public currentLinkTypeDescription: LinkTypeDescription = null,
        public linkDescriptions: CreateLinkDescription[] = null,
        public objectType: KIXObjectType = null,
        public formId: string = null,
        public canSubmit: boolean = false,
        public tableId: string = null,
        public filterCount: number = null,
        public loading: boolean = true
    ) { }
}
