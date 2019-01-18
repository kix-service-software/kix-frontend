import { FilterCriteria } from "../../FilterCriteria";

export interface ISearchFormListener {

    listenerId: string;

    searchCriteriaChanged(criteria: FilterCriteria[]): void;

    formReseted(): void;

}
