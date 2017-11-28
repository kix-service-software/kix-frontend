class TwoListSelection {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            firstList: input.firstList,
            secondList: input.secondList,
            firstListSelected: [],
            secondListSelected: []
        };
    }

    public onInput(input: any): void {
        this.state = {
            firstList: input.firstList,
            secondList: input.secondList
        };
    }

    private setFirstListSelected(selectedIds: any[]): void {
        this.state.firstListSelected = selectedIds;
    }

    private setSecondListSelected(selectedIds: any[]): void {
        this.state.secondListSelected = selectedIds;
    }

    private addToSecond(): void {
        // console.log(this.state.firstListSelected);
        // if (this.state.firstListSelected.length) {
        //     this.state.firstListSelected.forEach((id) => {
        //         const entry = this.state.firstList.find((me) => me.id === id);
        //         const index = this.state.firstList.findIndex((me) => me.id === id);

        //         this.state.firstList.splice(index, 1);

        //         this.state.configuration.secondList.push(entry);
        //     });
        //     this.state.firstListSelected = [];
        //     (this as any).setStateDirty('firstList');
        //     (this as any).setStateDirty('secondList');
        // }
    }
}

module.exports = TwoListSelection;
