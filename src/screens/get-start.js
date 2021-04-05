import React from 'react';

import {StatusBar} from 'react-native';
import {ThemedView} from 'src/components';
import GetStartSwiper from 'src/containers/GetStartSwiper';

import {rootSwitch} from 'src/config/navigator';

class GetStartScreen extends React.Component {
  handleGettingStarted = () => {
    const {navigation} = this.props;
    navigation.navigate(rootSwitch.enable_location);
  };

  render() {
    return (
      <ThemedView isFullView>
        <StatusBar hidden />
        <GetStartSwiper handleGettingStarted={this.handleGettingStarted} />
      </ThemedView>
    );
  }
}

export default GetStartScreen;
