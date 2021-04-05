import {put, call, takeEvery, select} from 'redux-saga/effects';
import {showMessage} from 'react-native-flash-message';
import * as Actions from './constants';
import {
  addToCart,
  getCart,
  addCoupon,
  removeCoupon,
  getShippingMethods,
  updateCartQuantity,
  removeCartItem,
} from './service';
import {cartKeySelector} from './selectors';
import {getCart as getCartAction} from './actions';
import {selectCartList} from './selectors';
import {handleError} from 'src/utils/error';
import {addCart, checkItemAddCart} from './helper';

/**
 * Add to cart saga REST API
 * @returns {IterableIterator<*>}
 */
function* addToCartSaga({payload}) {
  const {item, cb} = payload;
  try {
    const cartKey = yield select(cartKeySelector);
    const data = yield call(addToCart, item, cartKey);
    yield call(cb, {success: true});
    yield put({
      type: Actions.ADD_TO_CART_SUCCESS,
      payload: data.cart_key,
    });
    yield put(getCartAction());
  } catch (error) {
    if (cb) {
      yield call(cb, {success: false, error});
    }
  }
}

/**
 * Remove from cart saga REST API
 * @returns {IterableIterator<*>}
 */
function* removeFromCartSaga({payload}) {
  try {
    const cartKey = yield select(cartKeySelector);
    yield call(
      removeCartItem,
      {
        cart_item_key: payload,
      },
      cartKey,
    );
    // yield call(removeCartItem, {
    //   cart_item_key: key,
    // });
    yield call(showMessage, {
      message: 'You removed product success',
      type: 'success',
    });
    yield put({
      type: Actions.GET_CART,
    });
  } catch (error) {
    yield put({
      type: Actions.REMOVE_FROM_CART_ERROR,
    });
    yield call(showMessage, {
      message: error.message,
      type: 'danger',
    });
  }
}

/**
 * Update quantity cart saga REST API
 * @returns {IterableIterator<*>}
 */
function* updateQuantityCartSaga({payload}) {
  try {
    const {key, quantity} = payload;
    const cartKey = yield select(cartKeySelector);
    yield call(
      updateCartQuantity,
      {
        cart_item_key: key,
        quantity,
      },
      cartKey,
    );
    yield put({
      type: Actions.GET_CART,
    });
  } catch (error) {
    yield put({
      type: Actions.UPDATE_QUANTITY_CART_ERROR,
    });
    yield call(showMessage, {
      message: error.message,
      type: 'danger',
    });
  }
}

/**
 * Get list cart sage REST API
 * @returns {IterableIterator<*>}
 */
function* getCartSaga() {
  try {
    const cartKey = yield select(cartKeySelector);
    if (cartKey) {
      const query = {
        cart_key: cartKey,
      };
      const data = yield call(getCart, query);
      yield put({type: Actions.GET_CART_SUCCESS, payload: data});
    } else {
      yield put({type: Actions.GET_CART_ERROR});
    }
  } catch (e) {
    yield put({type: Actions.GET_CART_ERROR, error: e});
  }
}

/**
 * Add list to cart saga
 * @returns {IterableIterator<*>}
 */
function* addListToCartSaga({payload}) {
  const line_items = yield select(selectCartList);
  let data = line_items;
  const dataList = payload.map(item => {
    const {status, message} = checkItemAddCart(line_items, item);
    if (!status) {
      return {
        status: false,
        message,
      };
    } else {
      data = addCart(data, item);
      const {product} = item;
      return {
        status: true,
        name: product.get('name'),
      };
    }
  });
  const filterSuccess = dataList.filter(v => v.status);
  let name = '';
  if (filterSuccess.length > 0) {
    const arrayName = filterSuccess.map(v => v.name);
    name = arrayName.join(' and ');
  }

  if (!data.equals(line_items)) {
    showMessage({
      message: `"${name}" have been added to your cart.`,
      type: 'success',
    });
    yield put({
      type: Actions.ADD_TO_CART_VALIDATED,
      payload: data,
    });
  }
}

function* addCouponSaga({payload}) {
  try {
    const {code} = payload;
    const cartKey = yield select(cartKeySelector);
    const data = yield call(addCoupon, {coupon_code: code}, cartKey);
    // const data = yield call(addCoupon, {coupon_code: payload.code});
    if (data.success) {
      yield put({
        type: Actions.GET_CART_WHEN_UPDATE_COUPON,
      });
    } else {
      yield call(handleError, {
        message: 'Please check code again',
      });
      yield put({
        type: Actions.ADD_COUPON_ERROR,
      });
    }
  } catch (e) {
    yield put({
      type: Actions.ADD_COUPON_ERROR,
    });
    yield call(handleError, e);
  }
}

function* removeCouponSaga({payload}) {
  try {
    const {code} = payload;
    const cartKey = yield select(cartKeySelector);
    const data = yield call(removeCoupon, {coupon_code: code}, cartKey);
    if (data.success) {
      yield put({
        type: Actions.GET_CART_WHEN_DELETE_COUPON,
      });
    } else {
      yield call(handleError, {
        message: 'Please check code again',
      });
      yield put({
        type: Actions.REMOVE_COUPON_ERROR,
      });
    }
  } catch (e) {
    yield put({
      type: Actions.REMOVE_COUPON_ERROR,
    });
    yield call(handleError, e);
  }
}

function* getShipingMethodSaga() {
  try {
    const data = yield call(getShippingMethods);
    if (data && data.length) {
      yield put({
        type: Actions.GET_SHIPPING_METHOD_SUCCESS,
        payload: data,
      });
    } else {
      yield put({
        type: Actions.GET_SHIPPING_METHOD_ERROR,
      });
    }
  } catch (e) {
    yield call(handleError, e);
  }
}

export default function* cartSaga() {
  yield takeEvery(Actions.ADD_TO_CART_LIST, addListToCartSaga);
  yield takeEvery(Actions.ADD_COUPON, addCouponSaga);
  yield takeEvery(Actions.REMOVE_COUPON, removeCouponSaga);
  yield takeEvery(Actions.GET_SHIPPING_METHOD, getShipingMethodSaga);

  yield takeEvery(Actions.ADD_TO_CART, addToCartSaga);
  yield takeEvery(Actions.GET_CART, getCartSaga);
  yield takeEvery(Actions.REMOVE_FROM_CART, removeFromCartSaga);
  yield takeEvery(Actions.UPDATE_QUANTITY_CART, updateQuantityCartSaga);
  yield takeEvery(Actions.GET_CART_WHEN_UPDATE_COUPON, getCartSaga);
  yield takeEvery(Actions.GET_CART_WHEN_DELETE_COUPON, getCartSaga);
  yield takeEvery(Actions.UPDATE_CART_ITEM, getCartSaga);
}
