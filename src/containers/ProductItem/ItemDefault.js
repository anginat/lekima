import React from 'react';

import unescape from 'lodash/unescape';
import {compose} from 'recompose';
import {connect} from 'react-redux';

import {useTranslation} from 'react-i18next';
import {withNavigation} from '@react-navigation/compat';
import {withAddToCart} from 'src/hoc/hoc-add-to-cart';

import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import {Image, Text, withTheme} from 'src/components';
import PopupAddOns from './PopupAddOns';
import Price from './Price';
import ButtonAdd from './ButtonAdd';
import RatingItem from 'src/containers/RatingItem';
import BadgeItem from 'src/containers/BadgeItem';

import {styleCommonItem} from './style_common';
import {mainStack} from 'src/config/navigator';
import {configsSelector} from 'src/modules/common/selectors';
import {margin, padding, borderRadius} from 'src/components/config/spacing';

import {SIMPLE} from 'src/config/product';

const ItemFoodOne = props => {
  const {t} = useTranslation();
  const {
    item,
    width,
    height,
    navigation,
    navigationType,
    theme,
    containerStyle,
  } = props;

  const {
    id,
    name,
    images,
    price_format,
    on_sale,
    is_new,
    type,
    average_rating,
    purchasable,
    stock_status,
    meta_data,
    distance_matrix,
  } = item;
  // Product addons
  const addons = meta_data.find(meta => meta.key === '_product_addons');
  const isAddOns = addons && addons.value && addons.value.length > 0;
  const addonsSelected = props.state?.cart_item_data?.addons ?? [];

  // distance
  const {distance, duration} =
    distance_matrix &&
    distance_matrix.elements &&
    distance_matrix.elements.length &&
    distance_matrix.elements[0].status === 'OK'
      ? distance_matrix.elements[0]
      : {};
  return (
    <TouchableOpacity
      style={[
        styles.container,
        styleCommonItem.shadow,
        {
          width: width,
          backgroundColor: theme.colors.support.bgColor,
        },
        containerStyle && containerStyle,
      ]}
      onPress={() =>
        navigation[navigationType](mainStack.product, {product: item})
      }>
      <View>
        <Image
          source={
            images && images.length
              ? {uri: images[0].shop_catalog, cache: 'reload'}
              : require('src/assets/images/pDefault.png')
          }
          style={[{width, height}, styles.viewImage]}
          PlaceholderContent={<ActivityIndicator />}
        />
        <View style={styles.viewTopImage}>
          {stock_status === 'outofstock' ? (
            <BadgeItem
              title={t('common:text_sold_out')}
              nameColor="red"
              style={[styles.badge, styles.badgeLeft]}
            />
          ) : null}
          {on_sale ? (
            <BadgeItem
              title={t('common:text_promo')}
              nameColor="orange"
              style={[styles.badge, styles.badgeLeft]}
            />
          ) : null}
          {is_new ? (
            <BadgeItem
              title={t('common:text_new')}
              nameColor="blue"
              style={styles.badge}
            />
          ) : null}
        </View>
        <View style={styles.viewBottomImage}>
          {duration ? (
            <BadgeItem
              title={duration.text}
              nameColor="red"
              style={[styles.badge, styles.badgeLeft]}
            />
          ) : null}
          {distance ? (
            <BadgeItem
              title={distance.text}
              nameColor="green"
              style={styles.badge}
            />
          ) : null}
        </View>
      </View>
      <View style={styles.viewContent}>
        <View style={styles.viewName}>
          <Text medium style={styles.title} numberOfLines={2}>
            {unescape(name)}
          </Text>
          {purchasable && type === SIMPLE && stock_status !== 'outofstock' ? (
            <ButtonAdd
              onPress={isAddOns ? props.toggleModal : () => props.addCart(id)}
              loading={props.loading}
              style={styles.viewButtonAdd}
            />
          ) : null}
        </View>
        <View style={styles.viewPriceRating}>
          <View style={styles.price}>
            <Price priceFormat={price_format} />
          </View>
          <RatingItem rating={average_rating} />
        </View>
      </View>

      {isAddOns ? (
        <PopupAddOns
          product={item}
          visible={props.visible}
          toggleModal={props.toggleModal}
          loading={props.loading}
          bLoading={props.bLoading}
          addCart={props.addCart}
          buyNow={props.buyNow}
          addons={addons}
          addonsSelected={addonsSelected}
          quantity={props.state.quantity}
          updateAddons={props.updateAddons}
          decrement={props.decrement}
          increment={props.increment}
        />
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.base,
    marginBottom: 2,
  },
  viewImage: {
    borderTopLeftRadius: borderRadius.base,
    borderTopRightRadius: borderRadius.base,
  },
  viewTopImage: {
    position: 'absolute',
    top: padding.small - 2,
    left: padding.small,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  viewBottomImage: {
    position: 'absolute',
    bottom: padding.small - 2,
    left: padding.small,
    right: padding.small,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    marginVertical: 2,
  },
  badgeLeft: {
    marginRight: margin.small - 2,
  },
  // badge: {
  //   marginRight: margin.small - 2,
  // },
  viewContent: {
    padding: padding.small + 1,
    paddingBottom: padding.large,
    marginTop: 4,
  },
  viewName: {
    flexDirection: 'row',
    marginBottom: margin.small,
  },
  title: {
    flex: 1,
  },
  viewButtonAdd: {
    marginLeft: margin.small - 2,
  },
  viewPriceRating: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  price: {
    marginRight: margin.small,
  },
});

ItemFoodOne.defaultProps = {
  width: 227,
  height: 227,
  navigationType: 'navigate',
};

const mapStateToProps = state => {
  return {
    configs: configsSelector(state),
  };
};

export default compose(
  withTheme,
  withNavigation,
  connect(mapStateToProps),
  withAddToCart,
)(ItemFoodOne);
