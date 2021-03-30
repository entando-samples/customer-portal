import React, { Component } from 'react';
import { Form, TextInput, Select, SelectItem, Button } from 'carbon-components-react';
import * as portalUserApi from '../../../api/portalusers';
import { apiAddUserToProject, apiGetProjectIdNames } from '../../../api/projects';
import withKeycloak from '../../../auth/withKeycloak';
import { apiKeycloakUserGet } from '../../../api/keycloak';
import i18n from '../../../i18n';
class AssignUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projectId: '',
            assignUser: '',
            users: new Map(),
            projects: {},
            invalid: {},
            submitMsg: '',
            submitColour: 'black'
        };
    }

    componentDidMount() {
        const { t, keycloak } = this.props;

        const authenticated = keycloak.initialized && keycloak.authenticated;
        if (authenticated) {
            this.fetchData(keycloak.authServerUrl);
        }
    }

    componentDidUpdate(prevProps) {
        const { t, keycloak } = this.props;
        const authenticated = keycloak.initialized && keycloak.authenticated;
      
        const changedAuth = prevProps.keycloak.authenticated !== authenticated;
      
        if (authenticated && changedAuth) {
            this.fetchData(keycloak.authServerUrl);
        }
    }

    async fetchData(keycloakUrl) {
        const users = this.mapKeycloakUserEmails((await apiKeycloakUserGet(keycloakUrl)).data);
        const projects = (await apiGetProjectIdNames(this.props.serviceUrl)).data;
        this.setState({
            users,
            projects
        });
    }

    mapKeycloakUserEmails = keycloakUsers => {
        const usernameEmailMap = new Map();
        keycloakUsers.forEach(keycloakUser => usernameEmailMap.set(keycloakUser.username, keycloakUser.email));
        return usernameEmailMap;
    };

    handleChanges = e => {
        const input = e.target;
        const name = input.name;
        const value = input.value;
        this.setState({ [name]: value });
    };

    handleFormSubmit = event => {
        event.preventDefault();
        const { projectId, assignUser } = this.state;
        const formIsValid = this.handleFormValidation();

        if (formIsValid) {
            this.assignUserToProject(projectId, assignUser).then(res => {
                if (res.status === 201) {
                    this.setState({
                        submitMsg: i18n.t('submitMessages.updated'),
                        submitColour: '#24a148'
                    })
                } else {
                    this.setState({
                        submitMsg: i18n.t('submitMessages.error'),
                        submitColour: '#da1e28'
                    })
                }
            });
        }
    };

    handleFormValidation() {
        let invalid = {};
        let formIsValid = true;
        const { projectId, assignUser } = this.state;

        //name
        if (projectId === '') {
            formIsValid = false;
            invalid['projectId'] = true;
        }

        //customerNumber
        if (assignUser === '') {
            formIsValid = false;
            invalid['assignUser'] = true;
        }

        this.setState({ invalid: invalid });
        return formIsValid;
    }

    assignUserToProject = async (projectId, username) => {
        const portalUserId = await this.getPortalUserId({ username, email: this.state.users.get(username) });
        return await apiAddUserToProject(this.props.serviceUrl, projectId, portalUserId);
    };

    getPortalUserId = async keycloakUser => {
        let portalUserId = null;
        try {
            const portalUser = await portalUserApi.apiUserGetByUsername(this.props.serviceUrl, keycloakUser.username);
            portalUserId = portalUser.data.id;
        } catch (e) {
            if (e.message.toLowerCase().includes('not found')) {
                const portalUser = await this.createPortalUser(keycloakUser);
                portalUserId = portalUser.data.id;
            }
        }

        return portalUserId;
    };

    createPortalUser = async keycloakUser => {
        return await portalUserApi.apiUserPost(this.props.serviceUrl, { username: keycloakUser.username, email: keycloakUser.email });
    };

    setupFormComponents() {
        const users = this.state.users;
        const projectIdsNames = this.state.projects;
        let userList, projectList = (userList = null);

        if (users.size > 0) {
            userList = [...users.keys()].map((assignUser, i) => (
                <SelectItem key={i} text={assignUser} value={assignUser}>
                    {assignUser}
                </SelectItem>
            ));
            userList.unshift(<SelectItem key="-1" text={i18n.t('manageUsers.assign.userList')} value="" />);
        } else {
            userList = <SelectItem text={i18n.t('manageUsers.assign.noUsers')} value="" />;
        }

        if (projectIdsNames != null && Object.keys(projectIdsNames).length > 0) {
            projectList = Object.keys(projectIdsNames).map((projectId, i) => (
                <SelectItem key={i} text={projectIdsNames[projectId]} value={projectId}>
                    test
                </SelectItem>
            ));
            projectList.unshift(<SelectItem key="-1" text={i18n.t('manageUsers.assign.projectList')} value="" />);
        } else {
            projectList = <SelectItem text={i18n.t('manageUsers.assign.noProjects')} value="" />;
        }

        return { userList, projectList };
    }

    render() {
        const { userList, projectList } = this.setupFormComponents();

        return (
            <div>
                <p style={{color: this.state.submitColour}}>{this.state.submitMsg}</p>
                <Form onSubmit={this.handleFormSubmit}>
                    <div className="bx--grid">
                        <div className="bx--row">
                            <div className="bx--col">
                                <Select
                                    name="projectId"
                                    labelText={i18n.t('manageUsers.assign.projectName')}
                                    value={this.state.projectId}
                                    onChange={this.handleChanges}
                                    invalidText={i18n.t('validation.invalid.required')}
                                    invalid={this.state.invalid['projectId']}
                                >
                                    {projectList}
                                </Select>
                            </div>
                        </div>
                        <div className="bx--row">
                            <div className="bx--col">
                                <Select
                                    name="assignUser"
                                    labelText={i18n.t('manageUsers.assign.assignUser')}
                                    value={this.state.assignUser}
                                    onChange={this.handleChanges}
                                    invalidText={i18n.t('validation.invalid.required')}
                                    invalid={this.state.invalid['assignUser']}
                                >
                                    {userList}
                                </Select>
                            </div>
                        </div>
                        <Button kind="primary" tabIndex={0} type="submit">
                            {' '}
                            {i18n.t('buttons.submit')}{' '}
                        </Button>
                    </div>
                </Form>
            </div>
        );
    }
}

export default withKeycloak(AssignUser);
