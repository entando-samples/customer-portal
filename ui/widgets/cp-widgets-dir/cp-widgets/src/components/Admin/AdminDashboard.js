import React from 'react';
import i18n from '../../i18n';
import { Accordion, AccordionItem, PaginationNav, Search, Tile} from 'carbon-components-react';
import AddCustomerModal from './AddCustomerModal';
import AddPartnerModal from './AddPartnerModal';
import AddProjectModal from './AddProjectModal'
import withKeycloak from '../../auth/withKeycloak';
import { apiCustomersGet } from '../../api/customers';
import CustomerAccordian from '../Customer/CustomerAccordian';

class AdminDashboard extends React.Component {
    constructor() {
        super();
        this.state = {
            customers: {},
            customersProjects: {},
            role: ''
        }
    }

    componentDidMount(){
        this.getCustomer();
    }

    componentDidUpdate(prevProps) {
        const { keycloak } = this.props;
        const authenticated = keycloak.initialized && keycloak.authenticated;
    
        const changedAuth = prevProps.keycloak.authenticated !== authenticated;
    
        if (authenticated && changedAuth) {
          this.getCustomer();
        }
      }


    async getCustomer() {
        const { t, keycloak } = this.props;
        const authenticated = keycloak.initialized && keycloak.authenticated;
        if (authenticated) {
            const customers = await apiCustomersGet(this.props.serviceUrl);

            this.setState({
                customers: customers
            })
        }
    }

    render(){
        return(
            <div className="admin-dashboard">
                <h3 className="pageTitle">{i18n.t('adminDashboard.title')} {this.props.role} {i18n.t('adminDashboard.view')}</h3>
                <Tile>
                    <p className="title">{i18n.t('adminDashboard.allCustomers')}</p>
                    <div className="bx--row">
                        <div className="bx--col">
                            <Search id="search" placeHolderText={i18n.t('adminDashboard.searchText')} />
                        </div>
                        <div className="bx--col">
                            {this.props.role === 'Admin' ?
                            <div>
                                <AddPartnerModal serviceUrl={this.props.serviceUrl} />
                                <AddCustomerModal serviceUrl={this.props.serviceUrl} />
                                <AddProjectModal serviceUrl={this.props.serviceUrl} />
                            </div>
                            : null
                            }
                        </div>
                    </div>
                </Tile>  
                    
                <div className="form-container">
                    <Accordion>
                        {Object.keys(this.state.customers).length !== 0 ? this.state.customers.data.map((customer, index) => {
                                return(
                                    <CustomerAccordian role={this.props.role} serviceUrl={this.props.serviceUrl} customerNumber={customer.id} title={customer.name}/>
                                )
                        }) : null}
                    </Accordion>
                    <PaginationNav cssClass='pagination-right'/>
                </div>
            </div>
        )
    }
    
}

export default withKeycloak(AdminDashboard);
