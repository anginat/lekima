import values from 'lodash/values';
import React from 'react';
import includes from 'lodash/includes';
import {useTranslation} from 'react-i18next';
import {Alert, I18nManager, StyleSheet, View} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {connect} from 'react-redux';
import {Loading, ThemedView} from 'src/components';
import {padding} from 'src/components/config/spacing';
import {configsSelector, wishListSelector} from 'src/modules/common/selectors';
import Coupon from './Coupon';
import ItemProduct from './ItemProduct';
import TotalCart from './TotalCart';
import ViewUnderline from 'src/containers/ViewUnderline';
import ButtonSwiper from 'src/containers/ButtonSwiper';

import {addWishList, removeWishList} from 'src/modules/common/actions';
import {removeFromCart, updateQuantityCart} from 'src/modules/cart/actions';
import {
  loadingRemoveItemSelector,
  loadingUpdateQuantitySelector,
} from 'src/modules/cart/selectors';

const ProductsCart = React.memo(props => {
  const {t} = useTranslation();
  const {
    data,
    loadingRemove,
    loadingUpdate,
    configs,
    wishList,
    totals,
    dispatch,
  } = props;
  const lists =
    typeof data === 'object'
      ? values(data).filter(value => typeof value === 'object')
      : [];
  const widthButton = configs.toggleWishlist ? 140 : 70;

  const _renderFooter = () => {
    return (
      <ViewUnderline positionPadding={'top'}>
        <Coupon />
        <TotalCart totals={totals} />
      </ViewUnderline>
    );
  };
  const updateQuantity = (key, quantity) => {
    if (quantity < 1) {
      notificationDeleteItem(key);
    } else {
      dispatch(updateQuantityCart(key, quantity));
    }
  };
  const notificationDeleteItem = key => {
    Alert.alert(
      t('common:text_notification'),
      t('common:text_confirm_remove_item_cart'),
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => dispatch(removeFromCart(key)),
        },
      ],
      {cancelable: false},
    );
  };
  return (
    <ViewUnderline positionPadding={'top'} style={styles.container}>
      <SwipeListView
        useFlatList
        removeClippedSubviews={false}
        keyExtractor={item => item.key}
        data={lists}
        renderItem={({item, index}) => {
          return (
            <ThemedView style={styles.item}>
              <ItemProduct
                product={item}
                containerStyle={index === lists.length - 1 && styles.itemLast}
                changeQuantity={ !loadingRemove || !loadingUpdate ? updateQuantity : () => {}}
              />
            </ThemedView>
          );
        }}
        leftOpenValue={widthButton}
        rightOpenValue={-widthButton}
        renderHiddenItem={({item}) => {
          const hasList = includes(wishList, item.product_id);
          const wishListAction = hasList
            ? () => dispatch(removeWishList(item.product_id))
            : () => dispatch(addWishList(item.product_id));
          return (
            <View style={styles.viewButton}>
              {configs.toggleWishlist ? (
                <ButtonSwiper
                  type={hasList ? 'like' : 'unlike'}
                  onPress={wishListAction}
                />
              ) : null}
              <ButtonSwiper onPress={() => notificationDeleteItem(item.key)} />
            </View>
          );
        }}
        disableLeftSwipe={I18nManager.isRTL}
        disableRightSwipe={!I18nManager.isRTL}
        ListFooterComponent={_renderFooter}
      />
    </ViewUnderline>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: padding.small,
    paddingBottom: padding.small,
    paddingHorizontal: 0,
  },
  viewButton: {
    width: '100%',
    height: '95%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  item: {
    paddingHorizontal: padding.large,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
});

const mapStateToProps = state => {
  return {
    configs: configsSelector(state).toJS(),
    wishList: wishListSelector(state).toJS(),
    loadingRemove: loadingRemoveItemSelector(state),
    loadingUpdate: loadingUpdateQuantitySelector(state),
  };
};

export default connect(
  mapStateToProps,
  null,
)(ProductsCart);
