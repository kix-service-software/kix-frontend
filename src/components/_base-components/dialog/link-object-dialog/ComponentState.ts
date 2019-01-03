import { StandardTable } from "../../../../core/browser";
import { KIXObject, LinkTypeDescription, CreateLinkDescription, TreeNode, KIXObjectType } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public linkableObjectNodes: TreeNode[] = [],
        public currentLinkableObjectNode: TreeNode = null,
        public standardTable: StandardTable = null,
        public resultCount: number = 0,
        public selectedObjects: KIXObject[] = [],
        public linkTypeNodes: TreeNode[] = [],
        public currentLinkTypeNode: TreeNode = null,
        public currentLinkTypeDescription: LinkTypeDescription = null,
        public linkDescriptions: CreateLinkDescription[] = null,
        public objectType: KIXObjectType = null,
        public formId: string = null,
        public canSubmit: boolean = false,
        public tableId: string = null,
        public filterCount: number = null
    ) { }
}
