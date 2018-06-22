import { StandardTable } from "@kix/core/dist/browser";
import { KIXObject, LinkTypeDescription, CreateLinkDescription, TreeNode } from "@kix/core/dist/model";

export class ComponentState<T extends KIXObject> {

    public constructor(
        public linkableObjectNodes: TreeNode[] = [],
        public currentLinkableObjectNode: TreeNode = null,
        public standardTable: StandardTable<T> = null,
        public resultCount: number = null,
        public selectedObjects: T[] = [],
        public linkTypeNodes: TreeNode[] = [],
        public currentLinkTypeNode: TreeNode = null,
        public currentLinkTypeDescription: LinkTypeDescription = null,
        public linkDescriptions: CreateLinkDescription[] = [],
        public successHint: string = null,
        public canSearch: boolean = false
    ) { }
}
