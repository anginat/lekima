import React, { useState, useEffect } from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Text, ThemeConsumer} from 'src/components';

const ChangeCount = props => {
  const {count, changeValue} = props;

  const [_count, setCount] = useState(parseInt(count));
  useEffect(() => {
    setCount(parseInt(count));
  }, [count]);

  return (
    <ThemeConsumer>
      {({theme}) => (
        <View style={styles.container}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              if (parseInt(count, 0) === 0) {
                return;
              }
              changeValue(parseInt(_count, 0) - 1);
              setCount(parseInt(_count, 0) - 1);
            }}
            style={styles.viewDown(theme)}>
            <Text colorFourth medium>
              -
            </Text>
          </TouchableOpacity>
          <Text
            medium
            h4
            h4Style={[
              styles.textCount,
              {
                color: theme.colors.primary,
              },
            ]}>
            {_count}
          </Text>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              changeValue(parseInt(_count, 0) + 1);
              setCount(parseInt(_count, 0) + 1);
            }}
            style={styles.viewUp(theme)}>
            <Text medium style={{color: theme.colors.primary}}>
              +
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ThemeConsumer>
  );
};

const styles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDown: theme => ({
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: theme.colors.textColorFourth,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  viewUp: theme => ({
    marginLeft: 7,
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  textCount: {
    alignSelf: 'center',
    marginLeft: 7,
  },
};

export default ChangeCount;
