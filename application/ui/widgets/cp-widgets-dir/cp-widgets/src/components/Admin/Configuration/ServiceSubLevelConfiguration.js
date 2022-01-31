import React, { Component } from "react";
import { authenticationChanged, isAuthenticated, isPortalAdminOrSupport } from "../../../api/helpers";
import withKeycloak from "../../../auth/withKeycloak";
import i18n from "../../../i18n";
import { Button, Form, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, TextInput } from 'carbon-components-react';
import { apiProductVersionsGet } from "../../../api/productVersion";
import { Add16 } from '@carbon/icons-react'
import { apiTicketingSystemConfigResourcePost } from "../../../api/manageFieldConfigurations";
import { TICKETING_SYSTEM_CONFIG_ENUM } from "../../../api/constants";

class ServiceSubLevelConfiguration extends Component {
    constructor() {
        super();
        this.state = {
            subscriptionLevel: '',
            serviceSubTypeRowData : [],
            validations: [
                { isError: false, errorMsg: '' }
            ]
        };
    }

    componentDidMount() {
        if (isPortalAdminOrSupport()) {
            this.getProductVersions();
        }
        if (this.props.subLevel.length) {
            this.getSubscription()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.subLevel.length !== this.props.subLevel.length) {
            this.getSubscription()
        }
        if (authenticationChanged(this.props, prevProps)) {
            if (isPortalAdminOrSupport()) {
                this.getProductVersions();
            }
        }
    }

    getSubscription() {
        if (this.props.subLevel.length) {
            this.setState({ serviceSubTypeRowData: this.props.subLevel })
        }
    }

    async getProductVersions() {
        if (isAuthenticated(this.props)) {
            const productVersions = await apiProductVersionsGet(this.props.serviceUrl);

            this.setState({
                versions: productVersions.data,
            });
        }
    }

    handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!this.state.subscriptionLevel.length || this.state.subscriptionLevel.length < 3) {
            this.setState({ validations: { isError: true, errorMsg: "Subscription Level must be at least 3 characters" } })
            return
        }
        if (this.state.serviceSubTypeRowData.find((ticket) => (ticket.name.toLocaleLowerCase() === this.state.subscriptionLevel.toLocaleLowerCase()))) {
            this.setState({ validations: { isError: true, errorMsg: "This Subscription Level already exist, please enter a new Level" } })
            return
        }
        const subsListBuilder = [...this.state.serviceSubTypeRowData, { name: this.state.subscriptionLevel }];
        try {
            await apiTicketingSystemConfigResourcePost(this.props.serviceUrl, TICKETING_SYSTEM_CONFIG_ENUM.SUBSCRIPTION_LEVEL, subsListBuilder).then(() => {
                this.props.getTicketAndSubLevel()
            });
            const updateserviceSubTypeRowData = [...this.state.serviceSubTypeRowData, { levelName: this.state.subscriptionLevel }]
            this.setState({ serviceSubTypeRowData: updateserviceSubTypeRowData })
            this.setState({ subscriptionLevel: '' })
        } catch (error) {
            console.error('Error ', error)
        }
    }

    setFormData = (e) => {
        if ((!e && !e.target && !e.target.value) || e.target.value.length > 100) return
        this.setState({ validations: { isError: false, errorMsg: "" } })
        this.setState({ subscriptionLevel: e.target.value.trimStart() })
    }

    handleDeleteServiceSubType = async (ticket) => {
        if (window.confirm(`Are you sure you want to Delete the ${ticket.name} Subs Level Config!`)) {
            let updateServiceSubTypeAfterDeletedSubscr = []
            updateServiceSubTypeAfterDeletedSubscr = this.state.serviceSubTypeRowData.filter(ticketType => ticket.name !== ticketType.name)
            try {
                await apiTicketingSystemConfigResourcePost(this.props.serviceUrl, TICKETING_SYSTEM_CONFIG_ENUM.SUBSCRIPTION_LEVEL, updateServiceSubTypeAfterDeletedSubscr).then(() => {
                    this.props.getTicketAndSubLevel()
                });
                updateServiceSubTypeAfterDeletedSubscr = JSON.parse(updateServiceSubTypeAfterDeletedSubscr)
                this.setState({ serviceSubTypeRowData: updateServiceSubTypeAfterDeletedSubscr })
            } catch (error) {
                console.error(error);
            }
        }
    }

    render() {
        let subLevelRecord = []
        this.state.serviceSubTypeRowData.forEach((subscr) => {
            subLevelRecord.push(<TableRow key={subscr.name} id={subscr.name}>
                <TableCell>{subscr.name}</TableCell>
                <TableCell>
                    <Button
                        kind="ghost"
                        onClick={() => this.handleDeleteServiceSubType(subscr)}
                        style={{ display: 'flex', width: '100%', color: 'red' }}
                    >
                        {i18n.t('buttons.delete')}
                    </Button>
                </TableCell>
            </TableRow>)
        })
        if (isPortalAdminOrSupport()) {
            return (
                <>
                    <div>
                        <h4>{i18n.t('adminConfig.manageFieldConfigurations.subscriptionLevelConfiguration')}</h4>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {headerData.map((head, index) => (
                                            <TableHeader id={index} key={head.key}> {head.header}
                                            </TableHeader>
                                        ))}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {subLevelRecord}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <div className="bx--grid" style={{ margin: "0rem", padding: "0rem" }}>
                            <Form className="bx--row" style={{ margin: "2rem 0rem", padding: "0rem" }} onSubmit={this.handleFormSubmit}>
                                <div className="bx--col-lg-6" style={{ paddingLeft: "0rem" }}>
                                    <TextInput
                                        id="sublevel" labelText={i18n.t('adminConfig.manageFieldConfigurations.subscriptionLevel')} type="text"
                                        value={this.state.subscriptionLevel} onChange={this.setFormData}
                                        invalid={this.state.validations.isError} invalidText={this.state.validations.errorMsg}
                                        onBlur={() => { this.setState({ subscriptionLevel: this.state.subscriptionLevel.trimEnd() }) }}
                                    />
                                </div>
                                <div className="bx--col-lg-6">
                                    <Button size="lg" kind="tertiary" tabIndex={0} type="submit" renderIcon={Add16} style={{ "paddingTop": "0.5rem", "alignItems": "center" }}>
                                        {i18n.t('adminConfig.manageFieldConfigurations.addSubscriptionLevelButton')}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                    <hr />
                </>
            );
        } else {
            return <p>{i18n.t('userMessages.unauthorized')}</p>; 
        }
    }
}

const headerData = [
    {
        header: i18n.t('adminConfig.manageFieldConfigurations.subscriptionLevel'),
        key: 'sublevel',
    },
    {
        header: i18n.t('customerDashboard.action'),
        key: 'action',
    },
];

export default withKeycloak(ServiceSubLevelConfiguration);