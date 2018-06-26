import { FilterCriteria, FilterDataType, FilterType } from '@kix/core/dist/model';
import { SearchOperator } from '@kix/core/dist/browser';
export class ComponentState {
    public constructor(
        public criterias: FilterCriteria[] = [
            new FilterCriteria('Property mit ganz doll viel langem Namen und haufenweise Text',
                SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND,
                'Wert mit ganz viel Text und haufenweise Buchstaben und noch mehr Text und noch viel mehr Buchstaben.'),
            new FilterCriteria('Property 2', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test'),
            new FilterCriteria('Property 3', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test'),
            new FilterCriteria('Property 4', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test'),
            new FilterCriteria('Property 5', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test'),
            new FilterCriteria('Property 6', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test'),
            new FilterCriteria('Property 7', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test'),
            new FilterCriteria('Property 8', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test'),
            new FilterCriteria('Property 9', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test'),
            new FilterCriteria('Property 10', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test'),
            new FilterCriteria('Property 11', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test'),
            new FilterCriteria('Property 12', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'test')
        ],
        public fromHistory: boolean = false
    ) { }
}
