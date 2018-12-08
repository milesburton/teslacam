import PropTypes from 'prop-types';
import React, {Component} from 'react';
import socketIOClient from "socket.io-client";
import {
    Button,
    List,
    ListHeader,
    ListItem,
    Page,
    Switch
} from 'react-onsenui';

const withSettingsSubscription = (WrappedComponent) =>
    class extends Component {

        state = {data: []};

        componentDidMount() {
            const socket = socketIOClient(':8080');
            socket.on("services", data => this.setState({data}));
        }

        render() {
            return <WrappedComponent data={this.state.data} {...this.props} />;
        }

    };


class VideoPage extends Component {

    static propTypes = {
        data: PropTypes.array.isRequired
    };

    static defaultProp = {
        data: []
    };

    render() {
        console.log(JSON.stringify(this.props.data));
        return (
            <Page>
                <List
                    dataSource={this.props.data}
                    renderHeader={() =>
                        <ListHeader style={{fontSize: 15}} className="testClass">Settings</ListHeader> }
                    renderRow={({label, state}, idx) => (
                        <ListItem key={idx}>
                            <div className="center">
                                {label}
                            </div>
                            <div className="right">
                                <Switch checked={state} />
                            </div>
                        </ListItem>
                    )}/>
            </Page>
        );
    }
}

export default withSettingsSubscription(VideoPage);