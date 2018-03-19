import { FilterComponentState } from './FilterComponentState';

class FilterComponent {

    private state: FilterComponentState;

    public onCreate(): void {
        this.state = new FilterComponentState();
    }

    public onInput(input: any): void {
        this.state.filterValue = input.filterValue;
    }

    private filterValueChanged(event: any): void {
        this.state.filterValue = event.target.value;
    }

    private filter(): void {
        (this as any).emit('filter', this.state.filterValue);
    }

    private keyDown(event: any): void {
        // 13 == Enter
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.filterValueChanged(event);
            this.filter();
        }
    }

}

module.exports = FilterComponent;
