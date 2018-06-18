import { FilterComponentState } from './FilterComponentState';

class FilterComponent {

    private state: FilterComponentState;

    public onCreate(): void {
        this.state = new FilterComponentState();
    }

    private filterValueChanged(event: any): void {
        this.state.filterValue = event.target.value;
    }

    public keyDown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.filterValueChanged(event);
            this.filter();
        }
    }

    private filter(): void {
        (this as any).emit('filter', this.state.filterValue);
    }

}

module.exports = FilterComponent;
