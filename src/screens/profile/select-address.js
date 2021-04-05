import React from 'react';
import {withTranslation} from 'react-i18next';
import {Dimensions, StyleSheet, View, KeyboardAvoidingView} from 'react-native';
import {Marker} from 'react-native-maps';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {Header, ThemedView} from 'src/components';
import {borderRadius, margin, padding} from 'src/components/config/spacing';
import MapView from 'src/components/MapClustering';
import CurrentLocationMarker from 'src/components/MapClustering/CurrentLocationMarker';
import Button from 'src/containers/Button';
import {IconHeader, TextHeader} from 'src/containers/HeaderComponent';
import ViewFooterFixed from 'src/containers/ViewFooterFixed';
import {locationSelector} from 'src/modules/auth/selectors';
import {GooglePlacesAutocomplete} from 'src/components/GoogleSearchLocation/SaveYourLocation';
import {GOOGLE_API_KEY} from 'src/config/constant';

const {width, height} = Dimensions.get('window');

const WIDTH_MAP = width;
const HEIGHT_MAP = height - 300;

const ASPECT_RATIO = WIDTH_MAP / HEIGHT_MAP;

const LATITUDE_DELTA = 0.00322;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO + 0.0082;

class SelectAddress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locationSelected: {},
      initialRegion: {
        latitude: parseFloat(props?.location?.latitude ?? 0),
        longitude: parseFloat(props?.location?.longitude ?? 0),
      },
    };
  }

  confirmAddress() {
    const {route, navigation} = this.props;
    if (route?.params?.onGoBack) {
      route.params.onGoBack(this.state.locationSelected);
    }
    navigation.goBack();
  }
  render() {
    const {t, language} = this.props;
    const {initialRegion, locationSelected} = this.state;
    return (
      <ThemedView isFullView>
        <Header
          leftComponent={<IconHeader />}
          centerComponent={<TextHeader title="Save Your Location" />}
          backgroundColor={'transparent'}
        />
        <KeyboardAvoidingView behavior="padding" style={styles.viewContent}>
          <ViewFooterFixed
            footerElement={
              <Button onPress={() => this.confirmAddress()} title="Confirm" />
            }
            isShadow={false}>
            <View style={styles.viewMap}>
              <MapView
                onSelectecMarker={markers => {
                  console.log(markers);
                }}
                locationSelected={locationSelected}
                initialRegion={{
                  latitude: initialRegion?.latitude,
                  longitude: initialRegion?.longitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                }}>
                <Marker
                  coordinate={{
                    latitude: initialRegion?.latitude,
                    longitude: initialRegion?.longitude,
                  }}
                  centerOffset={{x: -18, y: -60}}
                  anchor={{x: 0.69, y: 1}}>
                  <CurrentLocationMarker />
                </Marker>
                {locationSelected?.geometry?.location?.lat ? (
                  <Marker
                    coordinate={{
                      latitude: parseFloat(
                        locationSelected?.geometry?.location?.lat,
                      ),
                      longitude: parseFloat(
                        locationSelected?.geometry?.location?.lng,
                      ),
                    }}
                    centerOffset={{x: -18, y: -60}}
                    anchor={{x: 0.69, y: 1}}>
                    <CurrentLocationMarker />
                  </Marker>
                ) : null}
              </MapView>
            </View>
            <View style={styles.viewInputSearch}>
              <GooglePlacesAutocomplete
                placeholder={t('common:text_placholder_location')}
                autoFocus={false}
                returnKeyType={'search'}
                fetchDetails={true}
                listViewDisplayed={true}
                nearbyPlacesAPI="GoogleReverseGeocoding"
                GooglePlacesDetailsQuery={{
                  fields: 'formatted_address,geometry',
                }}
                keyboardShouldPersistTaps={'always'}
                needGetCurrentLocation={false}
                showListOnFocus={true}
                onPress={(data, details = null) => {
                  this.setState({
                    locationSelected: details,
                  });
                }}
                query={{
                  key: GOOGLE_API_KEY,
                  language: language, // language of the results
                }}
                styles={{
                  textInput: {
                    marginLeft: 0,
                    marginRight: 0,
                    color:
                      initialRegion?.latitude &&
                      initialRegion?.latitude !== 'null'
                        ? 'black'
                        : 'gray',
                    fontSize: 14,
                    backgroundColor: '#ffffff',
                  },
                  predefinedPlacesDescription: {
                    color: '#1faadb',
                  },
                }}
                GooglePlacesSearchQuery={{
                  rankby: 'distance',
                }}
                currentLocation={true}
              />
            </View>
          </ViewFooterFixed>
        </KeyboardAvoidingView>
      </ThemedView>
    );
  }
}

const styles = StyleSheet.create({
  viewContent: {
    flex: 1,
  },
  viewMap: {
    flex: 1,
    overflow: 'hidden',
  },
  viewInputSearch: {
    position: 'absolute',
    top: padding.large,
    left: 0,
    right: 0,
  },
  viewInput: {
    borderRadius: borderRadius.base,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    justifyContent: 'center',
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
  iconSearch: {
    marginLeft: margin.large - 1,
  },
  containerViewInput: {
    paddingHorizontal: 0,
  },
  input: {
    paddingHorizontal: padding.large - 1,
  },
  viewListAddress: {
    maxHeight: 225,
  },
  item: {
    minHeight: 75,
  },
  subItem: {
    marginTop: margin.small - 2,
    lineHeight: 14,
  },
  iconItem: {
    height: '100%',
    paddingVertical: padding.large + 2,
  },
});
const mapStateToProps = state => {
  return {
    location: locationSelector(state),
  };
};

export default compose(
  withTranslation(),
  connect(
    mapStateToProps,
    null,
  ),
)(SelectAddress);
