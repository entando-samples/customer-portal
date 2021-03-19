package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Ticket;
import com.mycompany.myapp.domain.TicketingSystem;
import com.mycompany.myapp.security.AuthoritiesConstants;
import com.mycompany.myapp.service.JiraTicketingSystemService;
import com.mycompany.myapp.service.ProjectService;
import com.mycompany.myapp.service.TicketService;
import com.mycompany.myapp.service.TicketingSystemService;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Example;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing {@link com.mycompany.myapp.domain.Ticket}.
 */
@RestController
@RequestMapping("/api")
public class TicketResource {

    private final Logger log = LoggerFactory.getLogger(TicketResource.class);

    private static final String ENTITY_NAME = "custportAppTicket";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TicketService ticketService;
    private final JiraTicketingSystemService ticketingSystemService;
    private final ProjectService projectService;

    public TicketResource(TicketService ticketService, JiraTicketingSystemService ticketingSystemService,
                          ProjectService projectService) {
        this.ticketService = ticketService;
        this.ticketingSystemService = ticketingSystemService;
        this.projectService = projectService;
    }

    /**
     * {@code POST  /tickets} : Create a new ticket.
     *
     * @param ticket the ticket to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new ticket, or with status {@code 400 (Bad Request)} if the ticket has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/tickets")
    @PreAuthorize("hasAnyRole('" + AuthoritiesConstants.CUSTOMER + "', '" + AuthoritiesConstants.PARTNER +
        "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPPORT + "')")
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody Ticket ticket) throws URISyntaxException {
        log.debug("REST request to save Ticket : {}", ticket);
        if (ticket.getId() != null) {
            throw new BadRequestAlertException("A new ticket cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Ticket result = ticketService.save(ticket);
        return ResponseEntity.created(new URI("/api/tickets/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /tickets} : Updates an existing ticket.
     *
     * @param ticket the ticket to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated ticket,
     * or with status {@code 400 (Bad Request)} if the ticket is not valid,
     * or with status {@code 500 (Internal Server Error)} if the ticket couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/tickets")
    @PreAuthorize("hasAnyRole('" + AuthoritiesConstants.CUSTOMER + "', '" + AuthoritiesConstants.PARTNER +
        "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPPORT + "')")
    public ResponseEntity<Ticket> updateTicket(@Valid @RequestBody Ticket ticket) throws URISyntaxException {
        log.debug("REST request to update Ticket : {}", ticket);
        if (ticket.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Ticket result = ticketService.save(ticket);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, ticket.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /tickets} : get all the tickets.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tickets in body.
     */
    @GetMapping("/tickets")
    @PreAuthorize("hasAnyRole('" + AuthoritiesConstants.CUSTOMER + "', '" + AuthoritiesConstants.PARTNER +
        "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPPORT + "')")
    public List<Ticket> getAllTickets() {
        log.debug("REST request to get all Tickets");
        return ticketService.findAll();
    }

    /**
     * {@code GET  /tickets/:id} : get the "id" ticket.
     *
     * @param id the id of the ticket to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the ticket, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/tickets/{id}")
    @PreAuthorize("hasAnyRole('" + AuthoritiesConstants.CUSTOMER + "', '" + AuthoritiesConstants.PARTNER +
        "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPPORT + "')")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long id) {
        log.debug("REST request to get Ticket : {}", id);
        Optional<Ticket> ticket = ticketService.findOne(id);
        return ResponseUtil.wrapOrNotFound(ticket);
    }

    /**
     * {@code DELETE  /tickets/:id} : delete the "id" ticket.
     *
     * @param id the id of the ticket to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/tickets/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        log.debug("REST request to delete Ticket : {}", id);

        ticketService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString())).build();
    }

    /**
     * {@code GET  /tickets/ticketingsystem/:systemId} : get all the tickets in project.
     *
     * @param systemId the systemId of the ticket to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tickets in body.
     */
    @GetMapping("/tickets/ticketingsystem/{systemId}")
    @PreAuthorize("hasAnyRole('" + AuthoritiesConstants.CUSTOMER + "', '" + AuthoritiesConstants.PARTNER +
        "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPPORT + "')")
    public List<Ticket> fetchJiraTicketsByProject(@PathVariable String systemId) throws URISyntaxException {
        log.debug("REST request to get all Tickets by systemId: {}");
        List<Ticket> resultTickets = new ArrayList<Ticket>();

        // fetch tickets from Jira and store in a JSONArray
        TicketingSystem ts = ticketingSystemService.findTicketingSystemBySystemId(systemId);
        JSONObject response = new JSONObject(ticketingSystemService.fetchJiraTicketsBySystemId(systemId, ts.getUrl(),
            ts.getServiceAccount(), ts.getServiceAccountSecret()));

        JSONArray issues = new JSONArray(response.getJSONArray("issues"));

        // loop through tickets and check if they exist as Tickets in the db
        for (Object issue : issues) {
            JSONObject jsonIssue = (JSONObject) issue;
            String jiraKey = jsonIssue.getString("key");
            Ticket t = ticketService.findTicketBySystemId(jiraKey);
            // if Ticket exists in the db don't do anything
            if (t != null) {
                System.out.println("Ticket already exists.");
            }
            // else create a Ticket
            else {
                System.out.println("Creating ticket...");
                Ticket prepareTicketToCreate = prepareTicketToCreate(jiraKey, ts.getUrl(), ts.getServiceAccount(), ts.getServiceAccountSecret());
                createTicket(prepareTicketToCreate);
            }
            resultTickets.add(t);
        }

        // return JSON response from Jira
        return resultTickets;
    }

    /**
     * {@code GET  /tickets/ticketingsystem/:jiraProjectCode/:organizationNumber} : get all the tickets in project.
     *
     * @param jiraProjectCode the systemId of the tickets to retrieve.
     * @param organizationNumber the organization name of the tickets to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tickets in body.
     */
    @GetMapping("/tickets/ticketingsystem/{jiraProjectCode}/{organizationNumber}")
    @PreAuthorize("hasAnyRole('" + AuthoritiesConstants.CUSTOMER + "', '" + AuthoritiesConstants.PARTNER +
        "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPPORT + "')")
    public List<Ticket> fetchJiraTicketsByOrganizationAndProject(@PathVariable String jiraProjectCode,
                                                                 @PathVariable String organizationNumber) throws URISyntaxException {
        log.debug("REST request to get all Tickets by systemId and organization: {}");
        List<Ticket> resultTickets = new ArrayList<Ticket>();

        // fetch tickets from Jira and store in a JSONArray
        TicketingSystem ts = ticketingSystemService.findTicketingSystemBySystemId(jiraProjectCode);
        if (ts == null) {
            return null;
        }

        JSONObject response = new JSONObject(ticketingSystemService.fetchJiraTicketsBySystemIdAndOrganization(jiraProjectCode,
            organizationNumber, ts.getUrl(), ts.getServiceAccount(), ts.getServiceAccountSecret()));

        JSONArray issues = new JSONArray(response.getJSONArray("issues"));

        // loop through tickets and check if they exist as Tickets in the db
        for (Object issue : issues) {
            JSONObject jsonIssue = (JSONObject) issue;
            String jiraKey = jsonIssue.getString("key");
            Ticket t = ticketService.findTicketBySystemId(jiraKey);
            // if Ticket exists in the db, check to see if any values have changed
            if (t != null) {
                System.out.println("Ticket already exists. Updating values if needed.");
                // Summary
                if (t.getDescription() != (String) jsonIssue.getJSONObject("fields").get("summary")) {
                    t.setDescription((String) jsonIssue.getJSONObject("fields").get("summary"));
                    t.setUpdateDate(ZonedDateTime.now());
                }
                // Type
                if (t.getType() != (String) jsonIssue.getJSONObject("fields").getJSONObject("issuetype").get("name")) {
                    t.setDescription((String) jsonIssue.getJSONObject("fields").getJSONObject("issuetype").get("name"));
                    t.setUpdateDate(ZonedDateTime.now());
                }
                // Priority
                if (t.getPriority() != (String) jsonIssue.getJSONObject("fields").getJSONObject("priority").get("name")) {
                    t.setDescription((String) jsonIssue.getJSONObject("fields").getJSONObject("priority").get("name"));
                    t.setUpdateDate(ZonedDateTime.now());
                }
                // Status
                if (t.getStatus() != (String) jsonIssue.getJSONObject("fields").getJSONObject("status").getJSONObject("statusCategory").get("name")) {
                    t.setDescription((String) jsonIssue.getJSONObject("fields").getJSONObject("status").getJSONObject("statusCategory").get("name"));
                    t.setUpdateDate(ZonedDateTime.now());
                }
            }
            // else create a Ticket
            else {
                System.out.println("Creating ticket...");
                Ticket prepareTicketToCreate = prepareTicketToCreateWithProject(jiraKey, organizationNumber, ts.getUrl(),
                    ts.getServiceAccount(), ts.getServiceAccountSecret());
                createTicket(prepareTicketToCreate);
            }
            resultTickets.add(t);
        }

        // return JSON response from Jira
        return resultTickets;
    }

    /**
     * {@code GET  /tickets/ticketingsystem/:systemId} : Creating a new jira ticket in project.
     *
     * @param systemId the systemId of the project to create the ticket in.
     * @return the JSON response
     */
    @PostMapping("/tickets/ticketingsystem/{systemId}")
    @PreAuthorize("hasAnyRole('" + AuthoritiesConstants.CUSTOMER + "', '" + AuthoritiesConstants.PARTNER +
        "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPPORT + "')")
    public ResponseEntity<Ticket> createJiraTicket(@PathVariable String systemId, @Valid @RequestBody Ticket ticket)
        throws URISyntaxException {
        // find ticketing system for this systemId
        TicketingSystem ts = ticketingSystemService.findTicketingSystemBySystemId(systemId);

        // create ticket in Jira
        JSONObject response = new JSONObject(ticketingSystemService.createJiraTicket(systemId, ts.getUrl(),
            ts.getServiceAccount(), ts.getServiceAccountSecret(), ticket));
        String key = response.getString("key");

        // prepare Ticket from JSON response
        Ticket ticketToCreate = prepareTicketToCreate(key, ts.getUrl(), ts.getServiceAccount(),
            ts.getServiceAccountSecret());

        // return created Ticket
        return createTicket(ticketToCreate);
    }

    /**
     * {@code GET  /tickets/ticketingsystem/:jiraProjectCode/:organizationNumber} : Creating a new jira ticket in organization.
     *
     * @param jiraProjectCode the systemId of the project to create the ticket in.
     * @return the JSON response
     */
    @PostMapping("/tickets/ticketingsystem/{jiraProjectCode}/{organizationNumber}")
    @PreAuthorize("hasAnyRole('" + AuthoritiesConstants.CUSTOMER + "', '" + AuthoritiesConstants.PARTNER +
        "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPPORT + "')")
    public ResponseEntity<Ticket> createJiraTicketInOrg(@PathVariable String jiraProjectCode, @PathVariable String organizationNumber,
                                                        @Valid @RequestBody Ticket ticket) throws URISyntaxException {
        // find ticketing system for this systemId
        TicketingSystem ts = ticketingSystemService.findTicketingSystemBySystemId(jiraProjectCode);

        // create ticket in Jira
        JSONObject response = new JSONObject(ticketingSystemService.createJiraTicketInOrg(jiraProjectCode, organizationNumber, ts.getUrl(),
            ts.getServiceAccount(), ts.getServiceAccountSecret(), ticket));
        String key = response.getString("key");

        // prepare Ticket from JSON response
        Ticket ticketToCreate = prepareTicketToCreateWithProject(key, organizationNumber, ts.getUrl(), ts.getServiceAccount(),
            ts.getServiceAccountSecret());

        // return created Ticket
        return createTicket(ticketToCreate);
    }

    /**
     * {@code GET  /tickets/ticketingsystem/:systemId} : Creating a new jira ticket in project.
     *
     * @param systemId the systemId of the project to create the ticket in.
     * @return the JSON response
     */
    @PutMapping("/tickets/ticketingsystem/{systemId}")
    @PreAuthorize("hasAnyRole('" + AuthoritiesConstants.CUSTOMER + "', '" + AuthoritiesConstants.PARTNER +
        "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPPORT + "')")
    public ResponseEntity<Ticket> updateJiraTicket(@PathVariable String systemId, @Valid @RequestBody Ticket ticket)
        throws URISyntaxException {
        // find ticketing system for this systemId
        TicketingSystem ts = ticketingSystemService.findTicketingSystemBySystemId(systemId);

        ticketingSystemService.updateJiraTicket(ticket.getSystemId(), ts.getUrl(),
            ts.getServiceAccount(), ts.getServiceAccountSecret(), ticket);

        // create ticket in Jira
        /*

        JSONObject response = new JSONObject(ticketingSystemService.updateJiraTicket(ticket.getSystemId(), ts.getUrl(),
            ts.getServiceAccount(), ts.getServiceAccountSecret(), ticket));
        String key = response.getString("key");


        // prepare Ticket from JSON response
        Ticket ticketToCreate = prepareTicketToCreate(ticket.getSystemId(), ts.getUrl(), ts.getServiceAccount(),
            ts.getServiceAccountSecret());

         */

        // return created Ticket
        return updateTicket(ticket);
    }

    /**
     * {@code GET  /tickets/ticketingsystem/:systemId} : Deleting a ticket in project.
     *
     * @param systemId the systemId of the ticket
     */
    @DeleteMapping("/tickets/ticketingsystem/{systemId}")
    @PreAuthorize("hasAnyRole('" + AuthoritiesConstants.CUSTOMER + "', '" + AuthoritiesConstants.PARTNER +
        "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPPORT + "')")
    public String deleteJiraTicket(@PathVariable String systemId) {
        // find ticket by systemId in db
        String[] splitSystemId = systemId.split("-");
        TicketingSystem ts = ticketingSystemService.findTicketingSystemBySystemId(splitSystemId[0]);

        // delete Ticket in db
        Ticket ticketToDelete = ticketService.findTicketBySystemId(systemId);
        ticketService.delete(ticketToDelete.getId());

        // delete ticket in Jira and return status code
        return ticketingSystemService.deleteJiraTicket(systemId, ts.getUrl(), ts.getServiceAccount(), ts.getServiceAccountSecret());

    }

    public Ticket prepareTicketToCreate(String key, String url, String serviceAccount, String serviceAccountSecret) {
        Ticket ticketToCreate = new Ticket();
        JSONObject response = new JSONObject(ticketingSystemService.fetchSingleJiraTicketBySystemId(key, url,
            serviceAccount, serviceAccountSecret));
        ticketToCreate.setDescription((String) response.getJSONObject("fields").get("summary"));
        ticketToCreate.setSystemId(key);
        ticketToCreate.setType((String) response.getJSONObject("fields").getJSONObject("issuetype").get("name"));
        ticketToCreate.setCreateDate(ZonedDateTime.now());
        ticketToCreate.setUpdateDate(ZonedDateTime.now());
        return ticketToCreate;
    }

    public Ticket prepareTicketToCreateWithProject(String key, String organization, String url, String serviceAccount,
                                                   String serviceAccountSecret) {
        Ticket ticketToCreate = new Ticket();
        JSONObject response = new JSONObject(ticketingSystemService.fetchSingleJiraTicketBySystemId(key, url,
            serviceAccount, serviceAccountSecret));
        ticketToCreate.setDescription((String) response.getJSONObject("fields").get("summary"));
        ticketToCreate.setSystemId(key);
        ticketToCreate.setType((String) response.getJSONObject("fields").getJSONObject("issuetype").get("name"));
        ticketToCreate.setCreateDate(ZonedDateTime.now());
        ticketToCreate.setUpdateDate(ZonedDateTime.now());
        ticketToCreate.setProject(projectService.getProjectBySystemId(organization));
        return ticketToCreate;
    }
}
