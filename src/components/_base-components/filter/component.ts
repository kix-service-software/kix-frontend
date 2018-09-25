import { ComponentState } from './ComponentState';
import { KIXObjectPropertyFilter, TreeNode } from '@kix/core/dist/model';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.predefinedFilter) {
            this.state.predefinedFilter = input.predefinedFilter;
            this.state.predefinedFilterList = this.state.predefinedFilter.map(
                (pf: KIXObjectPropertyFilter, index) => new TreeNode(index, pf.name)
            );
        } else {
            this.state.predefinedFilter = [];
            this.state.predefinedFilterList = [];
        }
        this.state.predefinedFilterPlaceholder = typeof input.predefinedFilterPlaceholder !== 'undefined' ?
            input.predefinedFilterPlaceholder : "Alle Objekte";

        this.state.placeholder = typeof input.placeholder !== 'undefined' ? input.placeholder : 'Filtern in Liste';

        this.state.icon = typeof input.icon !== 'undefined' ? input.icon : 'kix-icon-filter';
    }

    private textFilterValueChanged(event: any): void {
        this.state.textFilterValue = event.target.value;
    }

    public predefinedFilterChanged(nodes: TreeNode[]): void {
        this.state.currentFilter = nodes && nodes.length ? nodes[0] : null;
        (this as any).setStateDirty('currentFilter');
        this.filter();
    }

    public keyDown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.textFilterValueChanged(event);
            this.filter();
        }
    }

    private filter(): void {
        const filter = this.state.currentFilter ? this.state.predefinedFilter[this.state.currentFilter.id] : null;
        (this as any).emit('filter', this.state.textFilterValue, filter);
    }

    public reset(): void {
        this.state.textFilterValue = null;
    }

}

module.exports = Component;
