import React, { Component } from 'react';
import { DataTable, TableContainer, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from 'carbon-components-react';
import '../../index.scss';
import { apiGetCustomersProjects } from '../../api/customers';
import { AuthenticatedView, UnauthenticatedView } from '../../auth/KeycloakViews';
import withKeycloak from '../../auth/withKeycloak';
import { Link } from 'react-router-dom';
import i18n from '../../i18n';
import EditProjectModal from '../Admin/EditProjectModal'
import { hasKeycloakClientRole } from '../../api/helpers';

class CustomTable extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: {}
     }
  }

  async fetchData() {
    const { t, keycloak } = this.props;
    const authenticated = keycloak.initialized && keycloak.authenticated;
    
    if (authenticated) {
        const projects = await apiGetCustomersProjects(this.props.serviceUrl, this.props.customerNumber);
        
        this.setState({
            data: projects
        });
    }
    this.render();
}

componentDidMount(){
    this.fetchData();
}

componentDidUpdate(prevProps) {
    const { keycloak } = this.props;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    const changedAuth = prevProps.keycloak.authenticated !== authenticated;

    if (authenticated && changedAuth) {
      this.fetchData();
    }
  }

  render() { 
    return (
      <div>
        <DataTable rows={rowData} headers={headerData} data={this.state.data}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer title={i18n.t('customerDashboard.subscriptions')} description={i18n.t('customerDashboard.tableDesc')}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
              {Object.keys(this.state.data).length !== 0 ? 
                  this.state.data.data.map((project, index) => {
                    if (project.projectSubscriptions.length === 0) {
                      return(
                        <TableRow key={index} >
                          <TableCell>{project.name}</TableCell>
                          {project.partners.length !== 0 ? 
                            <TableCell>
                              {project.partners.map(partner => (
                                <p>{partner.name}</p>
                              ))}
                            </TableCell> 
                          : <TableCell>None</TableCell>}
                          {project.entandoVersion ? <TableCell>{project.entandoVersion.name}</TableCell> : <TableCell>None</TableCell>}
                          <TableCell>None</TableCell>
                          <TableCell>None</TableCell>
                          <TableCell>None</TableCell>
                          <TableCell>{project.tickets.length}</TableCell>
                          <TableCell>{hasKeycloakClientRole('ROLE_ADMIN') || hasKeycloakClientRole('ROLE_SUPPORT') ? <EditProjectModal project={project} serviceUrl={this.props.serviceUrl}/> : null}</TableCell>
                      </TableRow>
                      )
                    }
                    else {
                      var sub = project.projectSubscriptions[project.projectSubscriptions.length - 1];
                      return(
                          <TableRow key={index} >
                              <TableCell><Link to={`/subscription-details/${sub.id}`}>{project.name}</Link></TableCell>
                              {project.partners.length !== 0 ? 
                                <TableCell>
                                  {project.partners.map(partner => (
                                    <p>{partner.name}</p>
                                  ))}
                                </TableCell> 
                                : <TableCell>None</TableCell>}
                              {project.entandoVersion ? <TableCell>{project.entandoVersion.name}</TableCell> : <TableCell>None</TableCell>}
                              <TableCell>{sub.status}</TableCell>
                              <TableCell>{String(new Date(sub.startDate))}</TableCell>
                              <TableCell>{String(new Date(new Date(sub.startDate).setMonth(new Date(sub.startDate).getMonth() + sub.lengthInMonths)))}</TableCell>
                              <TableCell>{project.tickets.length}</TableCell>
                              <TableCell>{hasKeycloakClientRole('ROLE_ADMIN') || hasKeycloakClientRole('ROLE_SUPPORT') ? <EditProjectModal project={project} serviceUrl={this.props.serviceUrl}/> : null}</TableCell>
                          </TableRow>
                        
                      )
                    }
                  }) : null
              }
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  )}
}
/*
const headerData = [
  {
    header: 'Project Name',
    key: 'projectName',
  },
  {
    header: 'Description',
    key: 'description',
  },
  {
    header: 'System Id',
    key: 'systemId',
  },
  {
    header: 'Notes',
    key: 'notes',
  },
  {
      header: 'Contact Name',
      key: 'contactName',
  },
  {
      header: 'Open Tickets',
      key: 'openTickets',
  },
];
*/

const headerData = [
  {
    header: i18n.t('customerDashboard.projectName'),
    key: 'projectName',
  },
  {
    header: i18n.t('customerDashboard.partners'),
    key: 'partners',
  },
  {
    header: i18n.t('customerDashboard.entandoVersion'),
    key: 'entandoVersion',
  },
  {
    header: i18n.t('customerDashboard.status'),
    key: 'status',
  },
  {
    header: i18n.t('customerDashboard.startDate'),
    key: 'startDate',
  },
  {
      header: i18n.t('customerDashboard.endDate'),
      key: 'endDate',
  },
  {
      header: i18n.t('customerDashboard.openTickets'),
      key: 'openTickets',
  },
  {
      header: i18n.t('customerDashboard.action'),
      key: 'action',
  }
];


const rowData = [
  {
       id: 'a',
       projectName: <a href="">Supplier Portal</a>,
       partnerName: 'Leonardo',
       entandoVersion: 5.2,
       startDate: 'October, 2019',
       endDate: 'October, 2022',
       openTickets: '5',
    },
    {
      id: 'b',
      projectName: <a href="">Task Manager</a>,
      partnerName: 'Veriday',
      entandoVersion: 5.2,
      startDate: 'July, 2019',
      endDate: 'July, 2022',
      openTickets: '2',
    },
    {
      id: 'c',
      projectName: <a href="">Sales Coordination App</a>,
      partnerName: 'Accenture',
      entandoVersion: 6.2,
      startDate: 'September, 2019',
      endDate: 'September, 2022',
      openTickets: '2',
    },
    {
      id: 'd',
      projectName: <a href="">Website</a>,
      partnerName: 'Veriday',
      entandoVersion: 5.2,
      startDate: 'October, 2019',
      endDate: 'October, 2022',
      openTickets: '1',
    }  
];
 
export default withKeycloak(CustomTable);