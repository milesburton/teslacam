import PropTypes from 'prop-types';
import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import {
  Button,
  List,
  ListHeader,
  ListItem,
  Page
} from 'react-onsenui';

const withVideoSubscription = WrappedComponent => class extends Component {
        state = { data: [] };

        componentDidMount() {
          const socket = socketIOClient(':8080');
          socket.on('video', data => this.setState({ data }));
        }

        render() {
          return <WrappedComponent data={this.state.data} {...this.props} />;
        }
};


const videoListItem = ({ name, size }) => (
    <>
      <div className="left">
        <video controls width="250">
          <source
            src={`video/${name}`}
            type="video/mp4"
          />
        </video>
      </div>
      <div className="center">
        <span className="list-item__title">{name}</span>
        <span
          className="list-item__subtitle"
        >
          {(size / 1024 / 1024).toFixed(1)}
Mb
        </span>
      </div>
    </>
);

const renderRow = (row, idx) => (
  <ListItem key={idx}>
    {videoListItem(row)}
  </ListItem>
);

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
            renderHeader={() => <ListHeader style={{ fontSize: 15 }}>Videos</ListHeader>}
            renderRow={renderRow}
          />
        </Page>
      );
    }
}

export default withVideoSubscription(VideoPage);
