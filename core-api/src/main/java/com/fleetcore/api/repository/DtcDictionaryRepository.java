package com.fleetcore.api.repository;

import com.fleetcore.api.model.DtcDictionaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DtcDictionaryRepository extends JpaRepository<DtcDictionaryEntry, UUID> {
    Optional<DtcDictionaryEntry> findByCode(String code);
    List<DtcDictionaryEntry> findBySystemCategory(String systemCategory);
    List<DtcDictionaryEntry> findBySeverity(String severity);
}
