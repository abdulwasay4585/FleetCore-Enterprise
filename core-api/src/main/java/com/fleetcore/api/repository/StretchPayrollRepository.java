package com.fleetcore.api.repository;

import com.fleetcore.api.model.StretchPayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface StretchPayrollRepository extends JpaRepository<StretchPayrollRecord, UUID> {
    List<StretchPayrollRecord> findByDriverId(UUID driverId);
    List<StretchPayrollRecord> findByPayPeriod(String payPeriod);
}
