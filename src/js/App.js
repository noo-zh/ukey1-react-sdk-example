import React, { Component } from 'react';
import Ukey1 from 'ukey1-react-sdk';
import DeviceStorage from 'react-device-storage';
import logo from '../media/logo.svg';
import '../css/App.css';

const URL = window.location.href;
const UKEY1_API_HOST = ''; // default host is used
const UKEY1_APP_ID = 'your-app-id';

const MODULE_UNAUTHORIZED = 1;
const MODULE_AUTHORIZED = 2;

const STORAGE = 'testapp';

function hashLocation(def) {
  let hash = window.location.hash;

  if (hash.search(/^#\//) === 0) {
    return hash.substring(1, hash.length);
  }

  return def;
}

class App extends Component {
  constructor(props) {
    super(props);

    this.storage = new DeviceStorage().sessionStorage(); // sessionStorage only for debug, otherwise use localStorage :-)
    let data = this.storage.read(STORAGE);

    this.state = {
      storage: (data ? new Ukey1().parseUserData(data) : null),
      authorized: (data ? true : false),
      module: (data ? MODULE_AUTHORIZED : MODULE_UNAUTHORIZED),
      location: hashLocation('/')
    };

    window.addEventListener('hashchange', this.handleNewHash.bind(this), false);
  }

  componentWillMount() {
    let gatewayResponse = (window.location.hash.search(/~auth~/) >= 0);

    if (!this.state.authorized) {
      if (gatewayResponse) {
        this.authorizationEvent();
      }
    }
  }

  handleNewHash() {
    this.setState({
      location: hashLocation('/')
    });

    console.log('Location: ' + this.state.location);
  }

  loginEvent(e) {
    e.preventDefault();

    let options = {
      host: UKEY1_API_HOST,
      appId: UKEY1_APP_ID,
      returnUrl: URL + (URL.search(/#/) >= 0 ? '' : '#') + '~auth~',
      scope: ['access_token', 'email', 'image'],
      signup: true
    };

    try {
      new Ukey1().connect(options);
    } catch (error) {
      console.log('Something was wrong', error);
    }
  }

  logoutEvent(e) {
    e.preventDefault();
    this.storage.delete(STORAGE);
    this.setState({
      storage: null,
      authorized: false,
      module: MODULE_UNAUTHORIZED,
      location: '/'
    });
  }

  authorizationEvent() {
    let options = {
      host: UKEY1_API_HOST,
      appId: UKEY1_APP_ID,
      success: function (data, dataObj) {
        this.storage.save(STORAGE, data);
        this.setState({
          storage: dataObj, // or new Ukey1().parseUserData(data)
          authorized: true,
          module: MODULE_AUTHORIZED,
          location: '/'
        });

      }.bind(this),
      finished: function (success) {
        window.history.replaceState(null, null, window.location.pathname);
      }
    };

    try {
      new Ukey1().accessToken(options);
    } catch (error) {
      console.log('Something was wrong', error);
    }
  }

  showImage() {
    let image = this.state.storage.getImage();

    if (image) {
      return <img src={this.state.storage.getImage()} alt="" />;
    }
  }

  authorized() {
    return (
      <p className="App-intro">
        You are authorized, {this.state.storage.getForename()}!<br />
        {this.showImage()}<br />
        <a href="#" onClick={this.logoutEvent.bind(this)}>Logout</a>
      </p>
    );
  }

  unauthorized() {
    return (
      <p className="App-intro">
        <a href="#" className="ukey1-button" onClick={this.loginEvent}>Sign in via Ukey1</a><br />
      </p>
    );
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        {this.state.authorized ? this.authorized() : this.unauthorized()}
      </div>
    );
  }
}

export default App;
