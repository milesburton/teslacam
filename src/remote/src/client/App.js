import React, { Component } from 'react';
import {
  Page,
  Toolbar,
  ToolbarButton,
  Icon,
  List,
  ListItem,
  Splitter,
  SplitterSide,
  SplitterContent
} from 'react-onsenui';

import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import VideoPage from './components/video-page';
import SettingsPage from './components/settings-page';

const pages = [
  {
    title: 'Video',
    component: <VideoPage />
  },
  {
    title: 'Settings',
    component: <SettingsPage />
  }
];

if (!localStorage.getItem('page')) {
  localStorage.setItem('page', pages[0].title);
}


// Make this a hoc
export default class App extends Component {
    state = {
      isOpen: false,
      Component: pages.find(({ title }) => title === localStorage.getItem('page')).component
    };

    renderToolbar = () => (
      <Toolbar>
        <div className="left">
          <ToolbarButton onClick={this.show}>
            <Icon icon="ion-navicon, material:md-menu" />
          </ToolbarButton>
        </div>
        <div className="center">Tesla Cam</div>
      </Toolbar>
    );

    select = (selectedPage) => {
      localStorage.setItem('page', selectedPage);
      const Component = pages.find(({ title }) => title === selectedPage).component;
      this.setState({ isOpen: false, Component });
    };

    show = () => {
      this.setState({ isOpen: true });
    };

    render() {
      return (
        <Splitter>
          <SplitterSide
            style={{
              boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
            }}
            side="left"
            width={200}
            collapse
            swipeable
            isOpen={this.state.isOpen}
            onClose={this.hide}
            onOpen={this.show}
          >
            <Page>
              <List
                dataSource={pages.map(({ title }) => title)}
                renderRow={title => (
                  <ListItem key={title} onClick={this.select.bind(this, title)} tappable>
                    {title}
                  </ListItem>
                )}
              />
            </Page>
          </SplitterSide>
          <SplitterContent>
            <Page renderToolbar={this.renderToolbar}>
              {this.state.Component}
            </Page>
          </SplitterContent>
        </Splitter>
      );
    }
}
