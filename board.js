var Avatar = React.createClass({
    render: function() {
        return (<img className="avatar img-rounded pull-right" src={this.props.user.avatar_url} />);
    }
});

var Label = React.createClass({
    render: function() {
        return (
            <div className="label-cell" style={{backgroundColor:this.props.label.color}}>
            </div>
        );
    }
});

var LabelList = React.createClass({
    render: function() {
        var labelNodes = this.props.labels.map(function (label){
            return (<Label key={label.name} label={label} />);
        });
        return (
            <div className="label-list">
                {labelNodes}
            </div>
        );
    }
});

var IssueCard = React.createClass({
    render: function() {
        return (
            <div className="card">
                <div className="card-block">
                    {this.props.issue.labels.length > 0 ? <LabelList labels={this.props.issue.labels} /> : null}
                    {this.props.issue.assignee != null ? <Avatar user={this.props.issue.assignee} /> : null}
                    <p className="card-text">[{this.props.issue.iid}] {this.props.issue.title}</p>
                </div>
            </div>
        );
    }
});

var IssueListHeader = React.createClass({
    render: function(){
        return (
            <div className="list-header text-center">
                <h3>{this.props.title} ({this.props.count})</h3>
            </div>
        );
    }
});

var IssueList = React.createClass({
    render: function() {
        var issueNodes = this.props.issues.map(function (issue) {
            return (<IssueCard key={issue.iid} issue={issue} />);
        });
        return (
            <div className="list-wrapper">
                <IssueListHeader title={this.props.title} count={this.props.issues.length} />
                <div className="card-wrapper">
                    {issueNodes}
                </div>
            </div>
        );
    }
});

function correctLabels(issues, labels){
    return issues.map(function(issue){
               issue.labels = issue.labels.map(function(label){
                   return labels[label]
               });
               return issue;
           });
}

function extractLabels(labels){
    return labels.reduce(function (obj, cur) {
               obj[cur.name] = cur;
               return obj;
           }, {});
}

var IssueRenderer = React.createClass({
    render: function(){
        var breakdown = this.props.issues.reduce(function(obj, cur){
                if(cur.assignee == null){
                    if(cur.labels.filter(function(label){ return (label.name == "feature" ||
                                                                  label.name == "optimization");
                                                         }).length > 0){
                        obj.features.push(cur);
                    }else{
                        obj.bugs.push(cur);
                    }
                }else{
                    if(this.props.mr_issues.has(cur.iid)){
                        obj.review.push(cur);
                    }else{
                        obj.active.push(cur);
                    }
                }
                return obj;
            }.bind(this),
            {features:[], bugs:[], active:[], review:[]});
        return (
            <div className="g-container">
                <div className="col">
                    <IssueList issues={breakdown.features} title="Features"/>
                </div>
                <div className="col">
                    <IssueList issues={breakdown.bugs} title="Bugs"/>
                </div>
                <div className="col">
                    <div className="segment">
                        <IssueList issues={breakdown.active} title="Active"/>
                    </div>
                    <div className="segment">
                        <IssueList issues={breakdown.review} title="Awaiting Review" />
                    </div>
                </div>
            </div>
        );
    }
});

var IssueController = React.createClass({
    getInitialState: function(){
        return {issues: [], mr_issues: new Set(), timer: 0};
    },
    loadIssues: function() {
        var params = $.param({state: "opened",
                              per_page: 100,
                              private_token: this.props.token});
        var url = `${this.props.host}/api/v3/projects/${this.props.project_id}/issues?${params}`;
        return $.get(url, function(result) {
            if (this.isMounted()) {
                this.setState({issues: correctLabels(result, this.state.labels)});
            }
        }.bind(this));
    },
    loadIssuesFromMR: function(mr) {
        var params = $.param({private_token: this.props.token});
        var url = `${this.props.host}/api/v3/projects/${this.props.project_id}/merge_requests/${mr.id}/closes_issues?${params}`;
        $.get(url, function(result){
            result.forEach(function(cur) {
                this.setState({mr_issues: this.state.mr_issues.add(cur.iid)});
            }.bind(this));
        }.bind(this));
    },
    loadMRList: function() {
        var params = $.param({state: "opened",
                              private_token: this.props.token});
        var url = `${this.props.host}/api/v3/projects/${this.props.project_id}/merge_requests?${params}`;
        return $.get(url, function(result) {
            result.forEach(function(cur){
                this.loadIssuesFromMR(cur);
            }.bind(this));
        }.bind(this));
    },
    refreshData: function() {
        console.log("Get Data");
        this.loadMRList();
        return this.loadIssues();
    },
    loadLabels: function() {
        var params = $.param({private_token: this.props.token});
        var url = `${this.props.host}/api/v3/projects/${this.props.project_id}/labels?${params}`;
        return $.get(url, function(result) {
            this.setState({labels: extractLabels(result)});
        }.bind(this));
    },
    setRefresh: function() {
        this.interval = setInterval(this.refreshData, 1000*this.props.refresh_interval);
    },
    componentDidMount: function() {
        this.loadLabels().always(function() {
            this.refreshData().always(function() {
                this.setRefresh();
            }.bind(this));
        }.bind(this));
    },
    componentWillUnmount: function() {
        clearInterval(this.interval);
    },
    render: function() {
        return (<IssueRenderer issues={this.state.issues} labels={this.state.labels} mr_issues={this.state.mr_issues}/>);
    }
});

React.render(
    <IssueController host={host} project_id={project_id} token={token} refresh_interval={30}/>,
    $('body')[0]
);
