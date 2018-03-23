import { SelectWithFilterComponentState } from './model/SelectWithFilterComponentState';
import { SelectWithFilterListElement } from '@kix/core/dist/model';

class SelectWithFilter {

    private state: SelectWithFilterComponentState;

    public onCreate(input: any): void {
        this.state = new SelectWithFilterComponentState(input.list, '', input.list);
    }

    public onInput(input: any): void {
        this.state.list = input.list;
        (this as any).setStateDirty();
    }

    public markSelected(event: any): void {
        const selectedElements = event.target.selectedOptions || [];
        const selectedIds = [];
        for (const element of selectedElements) {
            selectedIds.push(element.value);
        }
        this.state.list.forEach((listElement) => {
            if (selectedIds.indexOf(listElement.id) !== -1) {
                listElement.selected = true;
            } else {
                listElement.selected = false;
            }
        });
    }

    private filterChanged(event): void {
        this.state.filterValue = event.target.value;
    }

    private filter(): void {
        if (this.state.filterValue === null || this.state.filterValue === "") {
            this.state.filteredList = this.state.list;
        } else {
            const searchValue = this.state.filterValue.toLocaleLowerCase();
            this.state.filteredList = this.state.list.filter(
                (le: SelectWithFilterListElement) => le.label.toLocaleLowerCase().indexOf(searchValue) !== -1
            );
        }
        (this as any).setStateDirty('filteredList');
    }
}

module.exports = SelectWithFilter;
