var Avatar = React.createClass({
    render: function() {
        return (<img className="img-rounded pull-right" src={this.props.user.avatar_url} />);
    }
});

var IssueCard = React.createClass({
    render: function() {
        return (
            <div className="card">
                <div className="card-block">
                    {this.props.issue.assignee != null ? <Avatar user={this.props.issue.assignee} /> : null}
                    <p className="card-text">[{this.props.issue.iid}] {this.props.issue.title}</p>
                </div>
            </div>
        );
    }
});

var IssueCardList = React.createClass({
    render: function() {
        var issueNodes = this.props.issues.map(function (issue) {
            return (<IssueCard key={issue.iid} issue={issue} />);
        });
        return (
            <div className="col-md-4">
                {issueNodes}
            </div>
        );
    }
});

var IssueController = React.createClass({
    render: function(){
        return (
            <div className="row">
                <IssueCardList issues={tmp_data} />
                <IssueCardList issues={tmp_data} />
                <IssueCardList issues={tmp_data} />,
            </div>
        );
    }
});

React.render(
    <IssueController />,
    $('.container-fluid')[0]
);
