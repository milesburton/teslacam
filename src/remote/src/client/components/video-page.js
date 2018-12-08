import PropTypes from 'prop-types';
import React, {Component} from 'react';
import socketIOClient from "socket.io-client";
import {
    Button,
    List,
    ListHeader,
    ListItem,
    Page
} from 'react-onsenui';

const withVideoSubscription = (WrappedComponent) =>
    class extends Component {

        state = {data: []};

        componentDidMount() {
            const socket = socketIOClient(':8080');
            socket.on("video", data => this.setState({data}));
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
        return (
            <Page>
                <List
                    dataSource={this.props.data}
                    renderHeader={() =>
                        <ListHeader style={{fontSize: 15}} className="testClass">Latest Video</ListHeader> }
                    renderRow={(row, idx) => (
                        <ListItem key={idx}>
                            <div className="left">

                                <video controls width="250">

                                    <source src={`video/${row.name}`}
                                            type="video/mp4"/>

                                    Sorry, your browser doesn't support embedded videos.
                                </video>

                            </div>
                            <div className="center">
                                <span className="list-item__title">{row.name}</span><span
                                className="list-item__subtitle">Something</span>
                            </div>
                        </ListItem>
                    )}/>
            </Page>
        );
    }
}

export default withVideoSubscription(VideoPage);