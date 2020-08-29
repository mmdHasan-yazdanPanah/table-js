class CreateGrid {
    constructor(obj) {
        this.root = obj.root;
        this.columns = obj.columns;
        this.fullData = obj.data;
        this.oldData = obj.data;
        this.data = obj.data;
        this.table = document.createElement('table');
        this.columnsIndex = [];
        this.tableBody = document.createElement('tbody');
        this.lastFocusSearch = null;
        this.filter = {};
        this.lastSortTarget = null;
        this.insertIndex = obj.insertIndex;
        this.indexNameProperty = 'index';
        this.firstLoad = false;
        this.pagination = obj.hasOwnProperty('pagination');
        if (this.pagination) this.itemPerPage = obj.pagination;
        if (this.pagination) this.currenPage = 0;
        if (this.pagination) this.allPagesData = 0;
    }

    addIndex() {
        console.log('[addIndex]', this);

        this.columns.unshift({
            name: this.indexNameProperty,
            title: '#',
            sort: true,
            filterType: 'number',
        });

        this.fullData.forEach((row, index) => {
            row[this.indexNameProperty] = index + 1;
        });

        console.log('[addIndex]', this);
    }

    createHead() {
        const tableHead = document.createElement('thead');
        tableHead.className = 'thead-dark';

        const tableHeadTr = document.createElement('tr');
        tableHead.appendChild(tableHeadTr);

        // making Head
        this.columns.forEach((column, index) => {
            const columnItem = document.createElement('th');
            columnItem.scope = 'col';
            columnItem.setAttribute('data-name', column.name);
            columnItem.textContent = column.title;
            if (column.sort) {
                const sort = document.createElement('select');
                sort.className = 'custom-select ml-auto d-block mt-2';
                const sortDefault = document.createElement('option');
                sortDefault.textContent = 'مرتب کردن';
                sortDefault.disabled = true;
                sortDefault.selected = true;
                sort.appendChild(sortDefault);
                const sortAscending = document.createElement('option');
                sortAscending.textContent = 'صعودی';
                sort.appendChild(sortAscending);
                const sortDescending = document.createElement('option');
                sortDescending.textContent = 'نزولی';
                sort.appendChild(sortDescending);
                console.log(column);
                sort.onchange = () => this.sort(column.name, column.filterType, { 1: 'up', 2: 'down' });
                if (!this.firstLoad) {
                    if (this.insertIndex && column.name === this.indexNameProperty) {
                        sort.onselect = () => {
                            console.log('loaded');
                            this.sort(column.name, column.filterType, { 1: 'up', 2: 'down' });
                        };
                        sort.selectedIndex = 1;
                    }
                }
                columnItem.appendChild(sort);
            }
            if (column.filter) {
                const filter = document.createElement('input');
                filter.type = 'text';
                filter.placeholder = 'جستوجو';
                filter.className = 'form-control d-block ml-auto';
                filter.onkeyup = () => this.search(column.name);
                if (!column.sort) {
                    filter.classList.add('mt-2');
                }
                columnItem.appendChild(filter);
            }
            this.columnsIndex.push(column.name);
            tableHeadTr.appendChild(columnItem);
        });

        this.tableHead = tableHead;

        this.table.appendChild(tableHead);

        this.firstLoad = true;
        console.log('create Head');
    }

    createBody() {
        let currentData = [];

        if (this.pagination) {
            currentData = this.allPagesData[this.currenPage];
        } else {
            currentData = [...this.data];
        }

        console.log('[createBodyPage]', currentData);

        this.tableBody = document.createElement('tbody');

        // making Body
        currentData.forEach((row) => {
            const tableBodyTr = document.createElement('tr');
            this.columnsIndex.forEach((field, index) => {
                const columnInRowItem = document.createElement('td');
                columnInRowItem.textContent = row[field];
                columnInRowItem.classList.add('item');
                if (this.columns[index].edit) {
                    columnInRowItem.classList.add('table-editable');
                    columnInRowItem.onclick = () => this.selectItem(columnInRowItem, field, row);
                }
                tableBodyTr.appendChild(columnInRowItem);
            });
            this.tableBody.appendChild(tableBodyTr);
        });

        this.table.appendChild(this.tableBody);

        document.querySelector(this.root).appendChild(this.table);
    }

    clearBody() {
        if (this.table.contains(this.tableBody)) {
            this.table.removeChild(this.tableBody);
        }
    }

    search(columnName) {
        const target = event.currentTarget;

        (this.currentSeachFunc = () => {
            if (this.lastFocusSearch !== columnName && this.lastFocusSearch != null) {
                this.filter[this.lastFocusSearch] = this.oldData;
            }
            if (target.value === '') {
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
                if (row[columnName].toString().search(target.value) > -1) {
                    searchData.push(row);
                }
            });
            const columnFiltered = [];
            this.fullData.forEach((row) => {
                if (row[columnName].toString().search(target.value) > -1) {
                    columnFiltered.push(row);
                }
            });
            this.oldData = columnFiltered;

            this.data = searchData;

            this.lastFocusSearch = columnName;

            this.clearBody();

            let paginationNav;
            if (this.pagination) {
                paginationNav = this.createPage();
            }

            this.createBody();

            if (paginationNav) {
                document.querySelector(this.root).appendChild(paginationNav);
                this.paginationEl = paginationNav;
            }

            console.log(this);

            target.focus();
        })();
    }

    sort(columnName, columnType, sortType) {
        const target = event.currentTarget;

        (this.currentSort = () => {
            if (this.lastSortTarget == null) {
                this.oldSort = this.data;
            }

            this.clearSort(target);

            this.lastSortTarget = target;

            const type = sortType[target.selectedIndex];

            const sortData = [...this.data];

            console.log('[sort]', sortData);
            console.log('[sort]', columnName);

            if (columnType === 'string') {
                sortData.sort((a, b) => {
                    return a[columnName].localeCompare(b[columnName]);
                });
            }

            if (columnType === 'number') {
                sortData.sort((a, b) => a[columnName] - b[columnName]);
            }

            if (type === 'down') {
                sortData.reverse();
            }

            console.log('[sort]', sortData);

            this.data = sortData;

            this.clearBody();

            let paginationNav;
            if (this.pagination) {
                paginationNav = this.createPage();
            }

            this.createBody();

            if (paginationNav) {
                document.querySelector(this.root).appendChild(paginationNav);
                this.paginationEl = paginationNav;
            }
            console.log('sort');
        })();
    }

    clearSort(currentSelect) {
        this.tableHead.querySelectorAll('select').forEach((item) => {
            if (item !== currentSelect) {
                item.selectedIndex = '0';
            }
        });
    }

    selectItem(item, columnName, row) {
        const columnTitle = this.columns[this.columnsIndex.indexOf(columnName)].title;
        console.log(item);

        const replaceInput = document.createElement('input');
        replaceInput.type = 'text';
        replaceInput.className = 'form-control float-right mb-0';
        replaceInput.placeholder = columnTitle;
        replaceInput.value = item.textContent;
        replaceInput.onkeypress = (e) => {
            if (e.keyCode === 13) {
                replaceInput.blur();
            }
        };
        replaceInput.onblur = () => this.unSelectItem(item, columnName, row);
        item.replaceChild(replaceInput, item.childNodes[0]);
        replaceInput.focus();

        item.onclick = null;
    }

    unSelectItem(item, columnName, row) {
        let newValue = event.currentTarget.value;

        if (newValue.trim() !== '') {
            console.log('[trim True]', newValue.trim().length);
            this.data.forEach((item) => {
                if (item === row) {
                    item[columnName] = newValue;
                }
            });
            this.fullData.forEach((item) => {
                if (item === row) {
                    item[columnName] = newValue;
                }
            });
            this.oldData.forEach((item) => {
                if (item === row) {
                    item[columnName] = newValue;
                }
            });
        } else {
            console.log('[trim]', newValue.trim().length);
            newValue = row[columnName];
        }

        item.innerHTML = newValue;

        item.onclick = () => this.selectItem(item, columnName, row);

        if (this.hasOwnProperty('currentSort')) {
            this.currentSort();
        }

        if (this.hasOwnProperty('currentSeachFunc')) {
            this.currentSeachFunc();
        }
    }

    createPage() {
        if (this.paginationEl) {
            this.paginationEl.remove();
        }

        const nav = document.createElement('nav');

        const pagination = document.createElement('ul');
        pagination.className = 'pagination';
        nav.appendChild(pagination);

        const pageBefore = document.createElement('li');
        pageBefore.className = 'page-item';
        const pageBeforeLink = document.createElement('button');
        pageBeforeLink.className = 'page-link';
        pageBeforeLink.textContent = 'قبل';
        pageBeforeLink.onclick = () => this.chnagePage('before');
        pageBefore.appendChild(pageBeforeLink);
        pagination.appendChild(pageBefore);

        this.allPagesData = [];
        let data = [...this.data];
        while (data.length > this.itemPerPage) {
            this.allPagesData.push(data.splice(0, this.itemPerPage));
        }
        if (data.length > 0) {
            this.allPagesData.push(data);
        }

        for (let i = 1; i <= this.allPagesData.length; i++) {
            const page = document.createElement('li');
            page.className = 'page-item';
            if (i === this.currenPage + 1) {
                page.classList.add('active');
            }
            const pageLink = document.createElement('button');
            pageLink.className = 'page-link';
            pageLink.textContent = i;
            pageLink.onclick = () => this.chnagePage(i - 1);
            page.appendChild(pageLink);
            pagination.appendChild(page);
        }

        const pageNext = document.createElement('li');
        pageNext.className = 'page-item';
        const pageNextLink = document.createElement('button');
        pageNextLink.className = 'page-link';
        pageNextLink.textContent = 'بعد';
        pageNextLink.onclick = () => this.chnagePage('next');
        pageNext.appendChild(pageNextLink);
        pagination.appendChild(pageNext);

        nav.appendChild(pagination);

        if (this.allPagesData.length - 1 === this.currenPage) {
            pageNext.classList.add('disabled');
        }

        if (this.currenPage === 0) {
            pageBefore.classList.add('disabled');
        }

        console.log('[createPage]', this);
        console.log('[createPage]', data);

        return nav;
    }

    chnagePage(index) {
        const allPages = this.paginationEl.querySelectorAll('.page-item');
        const targerPar = event.currentTarget.parentElement;

        if (!targerPar.classList.contains('active') && !targerPar.classList.contains('disabled')) {
            if (index === 'next') {
                this.currenPage += 1;
            } else if (index === 'before') {
                this.currenPage -= 1;
            } else {
                this.currenPage = index;
            }

            allPages.forEach((pageLink, index) => {
                if (index === this.currenPage + 1) {
                    console.log(pageLink);
                    pageLink.classList.add('active');
                } else {
                    if (pageLink.classList.contains('active')) {
                        pageLink.classList.remove('active');
                    }
                }
            });

            if (this.allPagesData.length - 1 === this.currenPage) {
                allPages[allPages.length - 1].classList.add('disabled');
            } else {
                allPages[allPages.length - 1].classList.remove('disabled');
            }

            if (this.currenPage === 0) {
                allPages[0].classList.add('disabled');
            } else {
                allPages[0].classList.remove('disabled');
            }

            this.clearBody();

            let paginationNav;
            if (this.pagination) {
                paginationNav = this.createPage();
            }

            this.createBody();

            if (paginationNav) {
                document.querySelector(this.root).appendChild(paginationNav);
                this.paginationEl = paginationNav;
            }
        }
    }

    create() {
        if (!this.checkError()) {
            if (this.insertIndex) {
                this.addIndex();
            }

            this.table.className = 'table border border-danger';

            this.createHead();

            let paginationNav;
            if (this.pagination && !this.paginationEl) {
                paginationNav = this.createPage();
            }

            this.createBody();

            this.createPage();

            if (paginationNav) {
                document.querySelector(this.root).appendChild(paginationNav);
                this.paginationEl = paginationNav;
            }

            document.querySelector('body').style.height = document.querySelector('body').clientHeight + 'px';
        }
    }

    checkError() {
        let err = false;

        const columnsNames = [];
        this.columns.forEach((column) => {
            columnsNames.push(column.name);
        });

        console.log('[errorCheck]', this);

        // Check if we have two same Name for columns
        if (columnsNames.length !== [...new Set(columnsNames)].length) {
            err = true;
            throw Error('FOR USE GRID YOUR COLUMN NAMES MUST BE UNIQUE');
        }

        // Check if we have "inedx" name for column
        if (columnsNames.indexOf('index') > -1) {
            err = true;
            throw Error('FOR USE GRID YOUR COLUMN NAME MUST NOT BE "index"');
        }

        return err;
    }
}

const data = [
    { city: 'بوشهر', population: 1000000, distance: 12564897 },
    { city: 'تهران', population: 40000000, distance: 412564897 },
    { city: 'شیراز', population: 10000000, distance: 312564897 },
    { city: 'اصفحان', population: 20000000, distance: 222564897 },
];
const grid = new CreateGrid({
    root: '#root',
    columns: [
        {
            name: 'city',
            title: 'شهر',
            sort: true,
            filter: true,
            filterType: 'string',
            edit: true,
        },
        {
            name: 'population',
            title: 'جمعیت',
            sort: true,
            filter: true,
            filterType: 'number',
            edit: true,
        },
        {
            name: 'distance',
            title: 'اندازه',
            sort: true,
            filter: true,
            filterType: 'number',
            edit: true,
        },
    ],
    data: data,
    insertIndex: true,
    pagination: 3,
});

grid.create();
