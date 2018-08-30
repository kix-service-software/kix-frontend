import { WidgetConfiguration, ContextType, TreeNode } from '@kix/core/dist/model';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public nodes: TreeNode[] = [],
        public activeNode: TreeNode = null
    ) { }

}
