import React from 'react';

import {connect} from 'react-redux';
import firebase from '@react-native-firebase/app';
import {withTranslation} from 'react-i18next';

import {
  StyleSheet,
  ScrollView,
  View,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Formik} from 'formik';
import {Header, Loading, Text, ThemedView, ThemeConsumer} from 'src/components';
import Container from 'src/containers/Container';
import Input from 'src/containers/input/Input';
import InputMobile from 'src/containers/input/InputMobile';
import Button from 'src/containers/Button';
import {TextHeader, IconHeader} from 'src/containers/HeaderComponent';
import ModalVerify from './containers/ModalVerify';
import SocialMethods from './containers/SocialMethods';

import {signUpWithEmail} from 'src/modules/auth/actions';
import {authSelector} from 'src/modules/auth/selectors';
import {configsSelector, languageSelector} from 'src/modules/common/selectors';
import {checkPhoneNumber} from 'src/modules/auth/service';

import {authStack} from 'src/config/navigator';
import {margin, padding} from 'src/components/config/spacing';
import {lineHeights} from 'src/components/config/fonts';
import {showMessage} from 'react-native-flash-message';
import {INITIAL_COUNTRY} from 'src/config/config-input-phone-number';
import {formatPhoneWithCountryCode} from 'src/utils/phone-formatter';
import {validatorRegister} from '../../modules/auth/validator';

class RegisterScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      data: {
        first_name: '',
        last_name: '',
        name: '',
        email: '',
        password: '',
        phone_number: '',
        country_no: '',
        country_code: '',
        subscribe: false,
      },
      user: null,
      confirmResult: null,
      visibleModal: false,
      loading: false,
      error: {
        message: null,
        errors: null,
      },
    };
    this.confirmation = null;
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        const {data} = this.state;
        this.setState({
          user,
          data: {...data, phone_number: user.phoneNumber},
        });
      }
      if (this.state.confirmResult && Platform.OS === 'android') {
        this.register();
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  changeData = value => {
    this.setState({
      data: {
        ...this.state.data,
        ...value,
      },
    });
  };

  register = () => {
    const {enablePhoneNumber} = this.props;
    const {data, country_code} = this.state;
    let payload = data;
    if (enablePhoneNumber) {
      const currentUser = firebase.auth().currentUser;

      const user_phone_number =
        currentUser?._user?.phoneNumber ??
        formatPhoneWithCountryCode(data.phone_number, country_code);
      payload = Object.assign(data, {
        enable_phone_number: true,
        digits_phone: user_phone_number,
        digt_countrycode: data.country_no,
        digits_phone_no: data.phone_number,
      });
    }

    this.setState({loading: false});
    this.props.dispatch(signUpWithEmail(payload));
  };

  /**
   * Handle User register
   */

  handleSubmitRegister = async values => {
    const {user} = this.state;
    this.setState({
      loading: true,
      data: values,
    });
    try {
      const {enablePhoneNumber} = this.props;
      const {phone_number, country_code} = values;
      if (enablePhoneNumber) {
        const user_phone_number = formatPhoneWithCountryCode(
          phone_number,
          country_code,
        );

        await checkPhoneNumber({
          digits_phone: user_phone_number,
          type: 'register',
        });
        if (!user) {
          // Send Verify token
          const confirmResult = await firebase
            .auth()
            .signInWithPhoneNumber(user_phone_number);
          this.setState({
            confirmResult,
          });
        } else {
          this.register();
        }
      } else {
        this.register();
      }
    } catch (e) {
      showMessage({
        message: e.message,
        type: 'danger',
      });
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const {
      navigation,
      auth: {pending},
      enablePhoneNumber,
      t,
      language,
    } = this.props;
    const {visibleModal, loading, user, confirmResult} = this.state;
    const visible = visibleModal || !!(!user && confirmResult);
    return (
      <ThemeConsumer>
        {({theme}) => (
          <ThemedView isFullView>
            <Loading visible={pending} />
            <Header
              leftComponent={<IconHeader />}
              centerComponent={<TextHeader title={t('common:text_register')} />}
            />
            <Formik
              initialValues={this.state.data}
              validationSchema={validatorRegister(enablePhoneNumber, language)}
              onSubmit={this.handleSubmitRegister}>
              {({
                handleChange,
                handleSubmit,
                values,
                errors,
                setFieldValue,
                handleBlur,
                touched,
              }) => {
                return (
                  <KeyboardAvoidingView
                    behavior="height"
                    style={styles.keyboard}>
                    <ScrollView>
                      <Container>
                        <Input
                          label={t('auth:text_input_first_name')}
                          value={values.first_name}
                          onChangeText={handleChange('first_name')}
                          onBlur={handleBlur('first_name')}
                          error={touched.first_name ? errors.first_name : ''}
                        />
                        <Input
                          label={t('auth:text_input_last_name')}
                          value={values.last_name}
                          onChangeText={handleChange('last_name')}
                          onBlur={handleBlur('last_name')}
                          error={touched.last_name ? errors.last_name : ''}
                        />
                        <Input
                          label={t('auth:text_input_user')}
                          value={values.name}
                          onChangeText={handleChange('name')}
                          onBlur={handleBlur('name')}
                          error={touched.name ? errors.name : ''}
                        />
                        {enablePhoneNumber ? (
                          <InputMobile
                            value={values.phone_number}
                            initialCountry={INITIAL_COUNTRY}
                            onBlur={handleBlur('phone_number')}
                            onChangePhoneNumber={({value, code, isoCode}) => {
                              setFieldValue('phone_number', value);
                              setFieldValue('country_no', code);
                              setFieldValue('country_code', isoCode);
                            }}
                            error={
                              touched.phone_number ? errors.phone_number : ''
                            }
                          />
                        ) : null}
                        <Input
                          label={t('auth:text_input_email')}
                          value={values.email}
                          onBlur={handleBlur('email')}
                          onChangeText={value => setFieldValue('email', value)}
                          error={touched.email ? errors.email : ''}
                        />
                        <Input
                          label={t('auth:text_input_password')}
                          value={values.password}
                          secureTextEntry
                          onBlur={handleBlur('password')}
                          onChangeText={value =>
                            setFieldValue('password', value)
                          }
                          error={touched.password ? errors.password : ''}
                        />
                        <View style={styles.viewSwitch}>
                          <Text style={styles.textSwitch} colorSecondary>
                            {t('auth:text_agree_register')}
                          </Text>
                          <Switch
                            value={values.subscribe}
                            onValueChange={value =>
                              setFieldValue('subscribe', value)
                            }
                          />
                        </View>
                        <Button
                          title={t('auth:text_register')}
                          onPress={() => {
                            handleSubmit();
                          }}
                          loading={loading || pending}
                        />
                        <SocialMethods style={styles.viewAccount} />
                        <Text
                          medium
                          style={styles.textHaveAccount}
                          onPress={() => navigation.navigate(authStack.login)}>
                          {t('auth:text_already_account')}
                        </Text>
                        <ModalVerify
                          visible={visible}
                          type={'register'}
                          phone={
                            values.phone_number.includes(values.country_no)
                              ? values.phone_number
                              : values.country_no + values.phone_number
                          }
                          confirmation={confirmResult}
                          handleVerify={this.register}
                          setModalVisible={visibleNew =>
                            this.setState({
                              visibleModal: visibleNew,
                              loading: false,
                              confirmResult: null,
                            })
                          }
                        />
                      </Container>
                    </ScrollView>
                  </KeyboardAvoidingView>
                );
              }}
            </Formik>
          </ThemedView>
        )}
      </ThemeConsumer>
    );
  }
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  viewSwitch: {
    marginVertical: margin.big,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textSwitch: {
    flex: 1,
    lineHeight: lineHeights.h4,
    marginRight: margin.large,
  },
  viewAccount: {
    marginVertical: margin.big,
  },
  textHaveAccount: {
    paddingVertical: padding.small,
    marginTop: margin.base,
    marginBottom: margin.big,
    textAlign: 'center',
  },
});

const mapStateToProps = state => {
  const configs = configsSelector(state);
  return {
    auth: authSelector(state),
    language: languageSelector(state),
    enablePhoneNumber: configs.get('toggleLoginSMS'),
  };
};

export default connect(mapStateToProps)(withTranslation()(RegisterScreen));
