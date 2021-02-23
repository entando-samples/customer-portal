import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import keycloakType from 'components/__types__/keycloak';
import withKeycloak from 'auth/withKeycloak';
import { AuthenticatedView, UnauthenticatedView } from 'auth/KeycloakViews';
import { apiPortalUserPost } from 'api/portalUsers';
import Notification from 'components/common/Notification';
import PortalUserForm from 'components/PortalUserForm';

class PortalUserAddFormContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      notificationMessage: null,
      notificationStatus: null,
    };

    this.closeNotification = this.closeNotification.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  closeNotification() {
    this.setState({
      notificationMessage: null,
    });
  }

  async handleSubmit(portalUser) {
    const { t, onCreate, keycloak, serviceUrl } = this.props;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    if (authenticated) {
      try {
        const createdPortalUser = await apiPortalUserPost(serviceUrl, portalUser);
        onCreate(createdPortalUser);
        this.setState({
          notificationMessage: t('common.dataSaved'),
          notificationStatus: Notification.SUCCESS,
        });
      } catch (err) {
        this.handleError(err);
      }
    }
  }

  handleError(err) {
    const { onError, t } = this.props;
    onError(err);
    this.setState({
      notificationMessage: t('error.dataLoading'),
      notificationStatus: Notification.ERROR,
    });
  }

  render() {
    const { keycloak, onCancelEditing, t } = this.props;
    const { notificationMessage, notificationStatus } = this.state;

    return (
      <>
        <UnauthenticatedView keycloak={keycloak}>
          {t('common.notAuthenticated')}
        </UnauthenticatedView>
        <AuthenticatedView keycloak={keycloak}>
          <PortalUserForm onSubmit={this.handleSubmit} onCancelEditing={onCancelEditing} />
        </AuthenticatedView>
        <Notification
          status={notificationStatus}
          message={notificationMessage}
          onClose={this.closeNotification}
        />
      </>
    );
  }
}

PortalUserAddFormContainer.propTypes = {
  onError: PropTypes.func,
  onCancelEditing: PropTypes.func,
  onCreate: PropTypes.func,
  t: PropTypes.func.isRequired,
  keycloak: keycloakType.isRequired,
  serviceUrl: PropTypes.string,
};

PortalUserAddFormContainer.defaultProps = {
  onError: () => {},
  onCancelEditing: () => {},
  onCreate: () => {},
  serviceUrl: '',
};

export default withKeycloak(withTranslation()(PortalUserAddFormContainer));
