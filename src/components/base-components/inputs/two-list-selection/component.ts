class TwoListSelection {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            firstList: input.firstList,
            secondList: input.secondList
        };
    }
}

module.exports = TwoListSelection;
