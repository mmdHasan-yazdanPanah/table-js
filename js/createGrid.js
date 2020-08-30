class Sort {
    constructor(obj) {
        this.fullData = obj.data;
        this.data = obj.data;
    }

    // This method is for development puroses
    combineThis(thisObj) {
        Object.keys(this).forEach((key) => {
            if (thisObj.hasOwnProperty(key)) {
                thisObj[key] = this[key];
            }
        });
    }

    sort(columnName, columnType, sortType) {
        const sortData = [...this.data];

        if (columnType === 'string') {
            sortData.sort((a, b) => {
                return a[columnName].localeCompare(b[columnName]);
            });
        }

        if (columnType === 'number') {
            sortData.sort((a, b) => a[columnName] - b[columnName]);
        }

        if (sortType === 'down') {
            sortData.reverse();
        }

        this.data = sortData;

        console.log('[Sort Res]', this.data);
        return this.data;
    }
}

class Search {
    constructor(obj) {
        this.data = obj.data;
        this.lastFocusSearch = null;
        this.filter = {};
        this.oldData = obj.data;
        this.fullData = obj.data;
    }

    // This method is for development puroses
    combineThis(thisObj) {
        Object.keys(this).forEach((key) => {
            if (thisObj.hasOwnProperty(key)) {
                thisObj[key] = this[key];
            }
        });
    }

    search(textSearch, columnName) {
        if (this.lastFocusSearch !== columnName && this.lastFocusSearch != null) {
            this.filter[this.lastFocusSearch] = this.oldData;
        }
        if (textSearch === '') {
            this.filter[columnName] = this.fullData;
        }
        if (!this.filter.hasOwnProperty(columnName)) {
            this.filter[columnName] = this.fullData;
        }

        const data = [];
        this.fullData.forEach((row) => {
            let has = true;
            Object.values(this.filter).forEach((value) => {
                if (!value.includes(row)) {
                    has = false;
                }
            });
            if (has) data.push(row);
        });

        const searchData = [];
        data.forEach((row) => {
            if (row[columnName].toString().search(textSearch) > -1) {
                searchData.push(row);
            }
        });

        const columnFiltered = [];
        this.fullData.forEach((row) => {
            if (row[columnName].toString().search(textSearch) > -1) {
                columnFiltered.push(row);
            }
        });

        this.oldData = columnFiltered;

        this.data = searchData;

        this.lastFocusSearch = columnName;

        console.log('[Search Res]', this.data);
        return this.data;
    }

    clearSearch() {
        this.lastFocusSearch = null;
        this.filter = {};
    }

    fastSeacrh(textSearch) {
        const data = [];
        this.fullData.forEach((row) => {
            let has = true;
            Object.values(this.filter).forEach((value) => {
                if (!value.includes(row)) {
                    has = false;
                }
            });
            if (has) data.push(row);
        });

        const searchData = [];
        data.forEach((row) => {
            let matched = false;
            Object.values(row).forEach((value) => {
                if (value.toString().search(textSearch.toString()) > -1) {
                    matched = true;
                }
            });

            if (matched) searchData.push(row);
        });

        this.data = searchData;

        console.log('[FastSearch Res]', this.data);
        return this.data;
    }
}

class Pageination {
    constructor(obj) {
        this.data = obj.data;
        this.allPagesData;
    }

    getAllPagesData(itemPerPage) {
        this.allPagesData = [];
        let data = [...this.data];

        while (data.length > itemPerPage) {
            this.allPagesData.push(data.splice(0, itemPerPage));
        }

        if (data.length > 0) {
            this.allPagesData.push(data);
        }

        console.log('[Pagination Res]', this.allPagesData);
        return this.allPagesData;
    }
}

const data = [
    { city: 'بوشهر', population: 1000000, distance: 12564897 },
    { city: 'تهران', population: 40000000, distance: 422564897 },
    { city: 'شیراز', population: 10000000, distance: 312564897 },
    { city: 'اصفحان', population: 20000000, distance: 222514897 },
];

// const sortClass = new Sort({
//     data: data,
// });

// sortClass.sort('city', 'string', 'up');
// sortClass.sort('population', 'number', 'up');

// const search = new Search({
//     data: data,
// });

// search.search('ا', 'city');
// search.clearSearch();
// search.search(1, 'distance');
// search.fastSeacrh('ا');
// search.clearSearch();
// search.fastSeacrh('سیبن');
// search.fastSeacrh('1');

// const page = new Pageination({ data: data });

// page.getAllPagesData(3);
// page.getAllPagesData(2);
