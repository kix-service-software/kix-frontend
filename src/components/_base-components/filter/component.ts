import { FilterComponentState } from './FilterComponentState';

class FilterComponent {

    private state: FilterComponentState;

    public onCreate(): void {
        this.state = new FilterComponentState();
    }

    private filterValueChanged(event: any): void {
        this.state.filterValue = event.target.value;
    }

    private filter(): void {
        (this as any).emit('filter', this.state.filterValue);
    }

}

module.exports = FilterComponent;
