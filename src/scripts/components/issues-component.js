class IssuesComponent extends HtmlComponent {
    constructor(issues = []) {
        super();
        this.issues = issues;
        this.issueTable = new IssueTable();
        this.render();
    }

    render() {
        this.container = this.createElement('div', {
            className: 'issues-component sectionStyle'
        });

        // Create header
        const header = this.createElement('div', {
            className: 'flex items-center justify-between mb-4'
        });

        const title = this.createElement('h2', {
            className: 'text-lg font-semibold text-gray-900',
            textContent: 'Все дефекты'
        });
        header.appendChild(title);

        this.container.appendChild(header);
        this.container.appendChild(this.issueTable.getContainer());

        return this.container;
    }

    createEmptyTable() {
        return this.issueTable.createEmptyTable();
    }

    update(issues) {
        this.issues = issues;
        this.issueTable.update(issues);
    }
}