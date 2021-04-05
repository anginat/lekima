import React from 'react';
import {connect} from 'react-redux';
import unescape from 'lodash/unescape';
import split from 'lodash/split';
import {View, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text, Avatar, ThemeConsumer} from 'src/components';
import ChangeCount from 'src/containers/ProductItem/ChangeCount';
import {currencySelector} from 'src/modules/common/selectors';
import currencyFormatter from 'src/utils/currency-formatter';
import {padding, margin, borderRadius} from 'src/components/config/spacing';

const getUrlImage = thumb => {
  if (!thumb || typeof thumb !== 'string') {
    return null;
  }
  const array = split(thumb, 'src="');
  return split(array?.[1] ?? '', '"')[0];
};

const ItemProduct = React.memo(props => {
  const {product, changeQuantity, containerStyle, currency} = props;
  const {t} = useTranslation();
  if (!product) {
    return null;
  }
  const {key, name, thumb, thumbnail, price, quantity} = product;

  const generateTextAddOne = () => {
    let finalText = t('cart:text_name_store', {
      name: product?.store?.store_name,
    });
    if (product?.addons?.length) {
      for (let i = 0; i < product?.addons.length; i++) {
        const item = product?.addons[i];
        const lastItem = i === product?.addons.length - 1;
        const endText = !lastItem ? ', ' : '';
        finalText +=
          item.name +
          ': ' +
          item.value +
          '(' +
          currencyFormatter(item?.price || '0', currency) +
          ') ' +
          endText;
      }
    }

    return finalText;
  };

  const image = thumb || getUrlImage(thumbnail);

  return (
    <ThemeConsumer>
      {({theme}) => (
        <View
          style={[
            styles.container,
            {
              borderColor: theme.colors.border,
            },
            containerStyle && containerStyle,
          ]}>
          <Avatar
            source={
              image ? {uri: image} : require('src/assets/images/pDefault.png')
            }
            size={100}
            overlayContainerStyle={styles.avatar}
          />
          <View style={styles.right}>
            <Text medium h4>
              {unescape(name)}
            </Text>
            <View style={styles.viewInfo}>
              <Text h5 h5Style={styles.textInfo} colorThird>
                {generateTextAddOne()}
              </Text>
            </View>
            <View style={styles.viewPrice}>
              <Text medium h4>
                {currencyFormatter(price, currency)}
              </Text>
              <ChangeCount
                count={quantity}
                changeValue={value => changeQuantity(key, value)}
              />
            </View>
          </View>
        </View>
      )}
    </ThemeConsumer>
  );
});

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingVertical: padding.large,
    flexDirection: 'row',
  },
  avatar: {
    borderRadius: borderRadius.base,
    overflow: 'hidden',
  },
  right: {
    flex: 1,
    marginLeft: margin.large,
  },
  viewInfo: {
    marginTop: 5,
  },
  textInfo: {
    lineHeight: 24,
  },
  viewPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});

const mapStateToProps = state => {
  return {
    currency: currencySelector(state),
  };
};

export default connect(
  mapStateToProps,
  null,
)(ItemProduct);
