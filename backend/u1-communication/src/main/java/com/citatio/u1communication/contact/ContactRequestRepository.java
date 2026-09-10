package com.citatio.u1communication.contact;

import org.springframework.data.jpa.repository.JpaRepository;

/** Acces aux demandes de contact. Aucune jointure hors de citatio_u1_db. */
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {
}
