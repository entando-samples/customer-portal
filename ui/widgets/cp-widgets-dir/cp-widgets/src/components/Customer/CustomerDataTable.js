import {Component} from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell
} from 'carbon-components-react';
import '../../index.scss';
import {apiDeleteProjectFromCustomer, apiCustomerGet} from '../../api/customers';
import withKeycloak from '../../auth/withKeycloak';
import {Link} from 'react-router-dom';
import i18n from '../../i18n';
import {authenticationChanged, getActiveSubscription, isAuthenticated, isPortalAdminOrSupport} from '../../api/helpers';
import {apiCurrentTicketingSystemGet} from '../../api/ticketingsystem';
import ProjectActionItems from '../Admin/ProjectActionItems';
import {formatEndDate, formatStartDate} from '../../api/subscriptions';

class CustomerDataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: {},
      ticketingSystem: {},
      action: 'Edit',
      showMenu: {},
    };
    this.headerData = [
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
        header: i18n.t('customerDetails.notes'),
        key: 'notes',
      },
      {
        header: i18n.t('customerDashboard.action'),
        key: 'action',
      },
    ];
  }

  async fetchData() {
    if (isAuthenticated(this.props)) {
      try {
        const customer = await apiCustomerGet(this.props.serviceUrl, this.props.customerId);
        const projects = customer.data.projects;
        const ticketingSystem = await apiCurrentTicketingSystemGet(this.props.serviceUrl);
        this.setState({
          projects: projects,
          ticketingSystem: ticketingSystem,
        });
      } catch (error) {
        console.log(error);
      }
    }
    this.render();
  }

  componentDidMount() {
    if (isAuthenticated(this.props)) {
      this.fetchData();
    }
  }

  componentDidUpdate(prevProps) {
    if (authenticationChanged(this.props, prevProps)) {
      this.fetchData();
    }
  }

  updateProjectList = () => {
    this.fetchData();
  };

  showMenu = (e, id) => {
    var showMenu = {};
    showMenu[String(id)] = !this.state.showMenu[String(id)];
    this.setState({
      showMenu: showMenu,
    });
  };

  closeMenu = () => {
    this.setState(
      {
        showMenu: false,
      },
      () => {
        document.removeEventListener('click', this.closeMenu);
      }
    );
  };

  async deleteProject(id) {
    if (isAuthenticated(this.props)) {
      return await apiDeleteProjectFromCustomer(this.props.serviceUrl, this.props.customerId, id);
    }
  }

  handleDeleteProject = (e, id) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this project?')) {
      this.deleteProject(id)
        .then(() => {
          this.setState({
            submitMsg: i18n.t('submitMessages.deleted'),
            submitColour: '#24a148',
          });
          this.props.updateCustomerList();
        })
        .catch(() => {
          this.setState({
            submitMsg: i18n.t('submitMessages.error'),
            submitColour: '#da1e28',
          });
        });
    }
  };

  render() {
    return (
      <div>
        <DataTable rows={[{id: '1'}]} headers={this.headerData}>
          {({rows, headers, getHeaderProps, getTableProps}) => (
            <TableContainer description={i18n.t('customerDashboard.tableDesc')}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow key="headerRow">
                    {headers.map(header => {
                      let result;
                      if (header.header === i18n.t('customerDetails.notes')) {
                        if (isPortalAdminOrSupport()) {
                          result = <TableHeader {...getHeaderProps({header})}>{header.header}</TableHeader>;
                        }
                      } else {
                        result = <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>;
                      }
                      return result;
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(this.state.projects).length !== 0
                    ? this.state.projects.map((project, index) => {
                      const subscription = getActiveSubscription(project);
                      if (!subscription) {
                        return (
                          <TableRow key={index}>
                            <TableCell>{project.name}</TableCell>
                            {project.partners.length !== 0 ? (
                              <TableCell>
                                {project.partners.map((partner, partnerIndex) => (
                                  <div key={partnerIndex}>{partner.name}</div>
                                ))}
                              </TableCell>
                            ) : (
                              <TableCell>{i18n.t('userMessages.none')}</TableCell>
                            )}
                            <TableCell>{i18n.t('userMessages.none')}</TableCell>
                            <TableCell>{i18n.t('userMessages.none')}</TableCell>
                            <TableCell>{i18n.t('userMessages.none')}</TableCell>
                            <TableCell>{i18n.t('userMessages.none')}</TableCell>
                            <TableCell>{project.tickets && project.tickets.length}</TableCell>
                            {isPortalAdminOrSupport() ?
                              <TableCell style={{width: '250px'}}>{project.notes}</TableCell> : null}
                            <TableCell>
                              <ProjectActionItems
                                serviceUrl={this.props.serviceUrl}
                                ticketingSystem={this.state.ticketingSystem}
                                locale={this.props.locale}
                                project={project}
                                allProjects={this.state.projects}
                                handleDeleteProject={this.handleDeleteProject}
                                updateProjectList={this.updateProjectList}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        } else {
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Link to={`/subscription-details/${subscription.id}`}>{project.name}</Link>
                              </TableCell>
                              {project.partners.length !== 0 ? (
                                <TableCell>
                                  {project.partners.map((partner, partnerIndex) => (
                                    <div key={partnerIndex}>{partner.name}</div>
                                  ))}
                                </TableCell>
                              ) : (
                                <TableCell>{i18n.t('userMessages.none')}</TableCell>
                              )}
                              {subscription.entandoVersion ? (
                                <TableCell>{subscription.entandoVersion.name}</TableCell>
                              ) : (
                                <TableCell>{i18n.t('userMessages.none')}</TableCell>
                              )}
                              <TableCell>{subscription.status}</TableCell>
                              <TableCell>{formatStartDate(subscription.startDate)}</TableCell>
                              <TableCell>{formatEndDate(subscription.startDate, subscription.lengthInMonths)}</TableCell>
                              <TableCell>{project.tickets && project.tickets.length}</TableCell>
                              {isPortalAdminOrSupport() ?
                                <TableCell style={{width: '250px'}}>{project.notes}</TableCell> : null}
                              <TableCell>
                                <ProjectActionItems
                                  serviceUrl={this.props.serviceUrl}
                                  ticketingSystem={this.state.ticketingSystem}
                                  locale={this.props.locale}
                                  subscription={subscription}
                                  project={project}
                                  allProjects={this.state.projects}
                                  handleDeleteProject={this.handleDeleteProject}
                                  updateProjectList={this.updateProjectList}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        }
                      })
                    : null}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>
    );
  }
}

export default withKeycloak(CustomerDataTable);
