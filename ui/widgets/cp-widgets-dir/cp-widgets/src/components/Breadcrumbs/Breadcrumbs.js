import {Component} from 'react';
import withKeycloak from "../../auth/withKeycloak";
import {Breadcrumb, BreadcrumbItem} from "carbon-components-react";
import {getActiveSubscription, getPageUrl} from "../../api/helpers";
import {PAGE_CUSTOMER_PORTAL} from "../../api/constants";

class Breadcrumbs extends Component {

  render() {
    const homeUrl = getPageUrl(PAGE_CUSTOMER_PORTAL, this.props.locale);

    let customer = this.props.customer;
    const project = this.props.project;
    if (project) {
      customer = project.customer || {};
    }
    const subscription = this.props.subscription ? this.props.subscription : getActiveSubscription(project);

    return (
      <Breadcrumb style={{margin: "1em 0"}}>
        <BreadcrumbItem href={homeUrl}>Home</BreadcrumbItem>
        {customer && customer.name && (
          <BreadcrumbItem href={`${homeUrl}#/customer-details/${customer.id}`}>
            {customer.name}
          </BreadcrumbItem>
        )}
        {project && project.name && subscription.id && (
          <BreadcrumbItem href={`${homeUrl}#/subscription-details/${subscription.id}`}>
            {project.name}
          </BreadcrumbItem>
        )}
      </Breadcrumb>
    )
  }
}

export default withKeycloak(Breadcrumbs);
