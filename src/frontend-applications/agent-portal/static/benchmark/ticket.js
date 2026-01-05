function loadOpenTicketsWithOutAnything() {

    loadObjects('Ticket', null, null, 'benchmark-ticket-loadOpenTicketsWithOutAnything')
        .then((objects) => {
            console.log('got objects');
        })
        .catch((e) => console.error(e));

}

function loadOpenTicketsWithEmptyLoadingOptions() {

    loadObjects('Ticket', null, {}, 'benchmark-ticket-loadOpenTicketsWithEmptyLoadingOptions')
        .then((objects) => {
            console.log('got objects');
        })
        .catch((e) => console.error(e));

}

function loadOpenTicketsWithLoadingOptions() {

    const loadingOptions = {
        filter: [
            {
                property: 'StateType',
                operator: 'EQ',
                type: 'STRING',
                filterType: 'AND',
                value: 'Open'
            }
        ],
        limit: 0,
        includes: [],
        expands: [],
        query: [],
        searchLimit: 0
    };

    loadObjects('Ticket', null, loadingOptions, 'benchmark-ticket-loadOpenTicketsWithLoadingOptions')
        .then((objects) => {
            console.log('got objects');
        })
        .catch((e) => console.error(e));

}