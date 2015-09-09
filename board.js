var Avatar = React.createClass({
    render: function() {
        return (<img className="img-rounded pull-right" src={this.props.user.avatar_url} />);
    }
});

var Label = React.createClass({
    render: function() {
        var color = labels[this.props.label];
        return (
            <div className="label-cell" style={{backgroundColor:color}}>
            </div>
        );
    }
});

var LabelList = React.createClass({
    render: function() {
        var labelNodes = this.props.labels.map(function (label){
            return (<Label label={label} />);
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

var IssueCardList = React.createClass({
    render: function() {
        var issueNodes = this.props.issues.map(function (issue) {
            return (<IssueCard key={issue.iid} issue={issue} />);
        });
        return (
            <div className="col-md-4">
                <div className="list-wrapper">    
                    {issueNodes}
                </div>
            </div>
        );
    }
});

var IssueController = React.createClass({
    render: function(){
        return (
            <div className="row">
                <IssueCardList issues={tmp_data.filter(function(issue){
                                           return issue.assignee == null;
                                       })} />
                <IssueCardList issues={tmp_data.filter(function(issue){
                                           return issue.assignee != null;
                                       })} />
            </div>
        );
    }
});

React.render(
    <IssueController />,
    $('.container-fluid')[0]
);
