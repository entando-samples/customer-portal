import React from 'react';
import ReactDOM from 'react-dom';
import '../index.scss';
import * as Locale from '../i18n';

import KeycloakContext from '../auth/KeycloakContext';
import App from '../components/App';

import { subscribeToWidgetEvent } from '../helpers/widgetEvents';
import { KEYCLOAK_EVENT_TYPE } from './widgetEventTypes';

const getKeycloakInstance = () =>
  (window && window.entando && window.entando.keycloak && { ...window.entando.keycloak, initialized: true }) || {
    initialized: false,
  };

const ATTRIBUTES = {
  hidden: 'hidden',
  locale: 'locale',
  paginationMode: 'pagination-mode',
  disableDefaultEventHandler: 'disable-default-event-handler', // custom element attribute names MUST be written in kebab-case
  serviceUrl: 'service-url',
};

class AppElement extends HTMLElement {
  container;

  mountPoint;

  unsubscribeFromKeycloakEvent;

  keycloak = getKeycloakInstance();

  connectedCallback() {
    this.mountPoint = document.createElement('div');
    this.keycloak = { ...getKeycloakInstance(), initialized: true };

    this.unsubscribeFromKeycloakEvent = subscribeToWidgetEvent(KEYCLOAK_EVENT_TYPE, () => {
      this.keycloak = { ...getKeycloakInstance(), initialized: true };
      this.render();
    });

    this.render();

    //retargetEvents(shadowRoot);
    this.appendChild(this.mountPoint);
  }

  render() {
    const serviceUrl = this.getAttribute(ATTRIBUTES.serviceUrl) || '';
    const locale = this.getAttribute(ATTRIBUTES.locale) || '';
    Locale.setLocale(locale);

    ReactDOM.render(
      <KeycloakContext.Provider value={this.keycloak}>
        <App serviceUrl={serviceUrl} locale={locale} />
      </KeycloakContext.Provider>,
      this.mountPoint
    );
  }
}

customElements.get('cp-app') || customElements.define('cp-app', AppElement);
