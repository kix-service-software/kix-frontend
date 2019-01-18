import { WidgetConfiguration, ContextType, TreeNode } from '../../../../core/model';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contextType: ContextType = null,
        public contextId: string = null,
        public nodes: TreeNode[] = [],
        public activeNode: TreeNode = null
    ) { }

}
