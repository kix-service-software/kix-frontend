import { StandardTable } from "@kix/core/dist/browser";
import { KIXObject, LinkTypeDescription, CreateLinkDescription, TreeNode, KIXObjectType } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public linkableObjectNodes: TreeNode[] = [],
        public currentLinkableObjectNode: TreeNode = null,
        public standardTable: StandardTable = null,
        public resultCount: number = null,
        public selectedObjects: KIXObject[] = [],
        public linkTypeNodes: TreeNode[] = [],
        public currentLinkTypeNode: TreeNode = null,
        public currentLinkTypeDescription: LinkTypeDescription = null,
        public linkDescriptions: CreateLinkDescription[] = [],
        public successHint: string = null,
        public canSearch: boolean = false,
        public objectType: KIXObjectType = null,
        public formId: string = null,
        public loading: boolean = true
    ) { }
}
