import { FilterComponentState } from './FilterComponentState';
import { FormDropdownItem, TableFilterCriteria, KIXObjectPropertyFilter, TreeNode } from '@kix/core/dist/model';

class FilterComponent {

    private state: FilterComponentState;

    public onCreate(): void {
        this.state = new FilterComponentState();
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

}

module.exports = FilterComponent;
