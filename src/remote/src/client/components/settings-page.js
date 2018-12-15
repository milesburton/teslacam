import PropTypes from 'prop-types';
import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import {
  Button,
  List,
  ListHeader,
  ListItem,
  Page,
  Switch
} from 'react-onsenui';

const withSettingsSubscription = WrappedComponent => class extends Component {
        state = { data: [] };

        socket = socketIOClient(':8080');

        componentDidMount() {
          this.socket.on('services', this.onReceivedData);
        }

        componentWillUnmount() {
          this.socket.removeListener('services', this.onReceivedData);
        }

        onReceivedData = (data) => {
          this.setState({ data });
        };

        toggleVideo = (label) => {
          this.socket.emit('toggle-service', { label });
        };

        render() {
          return <WrappedComponent onToggleVideo={this.toggleVideo} data={this.state.data} {...this.props} />;
        }
};


class VideoPage extends Component {
    static propTypes = {
      data: PropTypes.array.isRequired,
      onToggleVideo: PropTypes.func.isRequired
    };

    static defaultProp = {
      data: []
    };

    toggle = (label) => {
      this.props.onToggleVideo(label);
    };

    render() {
      return (
        <Page>
          <List
            dataSource={this.props.data}
            renderHeader={() => <ListHeader style={{ fontSize: 15 }}>Settings</ListHeader>}
            renderRow={({ label, state }, idx) => (
              <ListItem key={idx}>
                <div className="center">
                  {label}
                </div>
                <div className="right">
                  <Switch checked={state} onChange={() => this.toggle(label)} />
                </div>
              </ListItem>
            )}
          />
        </Page>
      );
    }
}

export default withSettingsSubscription(VideoPage);
