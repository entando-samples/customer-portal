package com.entando.customerportal.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.entando.customerportal.domain.TicketingSystem;
import com.entando.customerportal.domain.TicketingSystemConfig;
import com.entando.customerportal.security.AuthoritiesConstants;
import com.entando.customerportal.security.SpringSecurityAuditorAware;
import com.entando.customerportal.service.TicketingSystemConfigService;
import com.entando.customerportal.web.rest.errors.BadRequestAlertException;

import io.github.jhipster.web.util.HeaderUtil;

@RestController
@RequestMapping("/api/config")
//@Transactional
@PreAuthorize(AuthoritiesConstants.HAS_ADMIN_OR_SUPPORT)
public class TicketingSystemConfigResource {
	
	private final Logger log = LoggerFactory.getLogger(TicketingSystemConfigResource.class);

    private static final String ENTITY_NAME = "custportAppCustomer";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;
    
    private final TicketingSystemConfigService configService;
    
    @Autowired
    SpringSecurityAuditorAware springSecurityAuditorAware;

    public TicketingSystemConfigResource(TicketingSystemConfigService configService) {
        this.configService = configService;
    }
    
    @PostMapping("/ticketing-system-config")
    @PreAuthorize(AuthoritiesConstants.HAS_ADMIN)
    public ResponseEntity<TicketingSystemConfig> createTicketingSystemConfiguration(@Valid @RequestBody TicketingSystemConfig ticketType) throws URISyntaxException {
        log.debug("REST request to save TicketType : {}", ticketType);
        if (ticketType.getId() != null) {
            throw new BadRequestAlertException("A new ticketing system type cannot already have an ID", ENTITY_NAME, "idexists");
        }
        TicketingSystemConfig result = configService.saveTicketingSystemConfiguration(ticketType);
        return ResponseEntity.created(new URI("/api/tickettype/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }
    
    @GetMapping("/ticketing-system-config")
    @PreAuthorize(AuthoritiesConstants.HAS_ANY_PORTAL_ROLE)
    public List<TicketingSystemConfig> getAllTicketingSystemConfigrations() {
        log.debug("REST request to get all TicketingSystems");
        return configService.getAllTicketingSystemConfiguration();
    }
}
