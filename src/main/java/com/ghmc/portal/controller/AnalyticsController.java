package com.ghmc.portal.controller;

import com.ghmc.portal.model.Grievance;
import com.ghmc.portal.model.GrievanceStatus;
import com.ghmc.portal.service.GrievanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final GrievanceService grievanceService;

    public AnalyticsController(GrievanceService grievanceService) {
        this.grievanceService = grievanceService;
    }

    /**
     * Get Combined All-Zones Analytics Report (Super Admin / Municipal Commissioner only)
     */
    @GetMapping("/combined")
    @PreAuthorize("hasAnyAuthority('ROLE_MUNICIPAL_COMMISSIONER')")
    public ResponseEntity<Map<String, Object>> getCombinedAnalytics() {
        List<Grievance> all = grievanceService.getAllGrievances();

        long total = all.size();
        long submitted = all.stream().filter(g -> g.getStatus() == GrievanceStatus.SUBMITTED).count();
        long inProgress = all.stream().filter(g -> g.getStatus() == GrievanceStatus.IN_PROGRESS).count();
        long resolved = all.stream().filter(g -> g.getStatus() == GrievanceStatus.RESOLVED).count();
        long rejected = all.stream().filter(g -> g.getStatus() == GrievanceStatus.REJECTED).count();

        int resolutionRate = total > 0 ? (int) Math.round((double) resolved / total * 100) : 100;

        Map<String, Object> response = new HashMap<>();
        response.put("reportType", "COMBINED_ALL_ZONES");
        response.put("totalGrievances", total);
        response.put("openCount", submitted + inProgress);
        response.put("submittedCount", submitted);
        response.put("inProgressCount", inProgress);
        response.put("resolvedCount", resolved);
        response.put("rejectedCount", rejected);
        response.put("resolutionRate", resolutionRate);

        return ResponseEntity.ok(response);
    }

    /**
     * Get Zonal Performance & Comparative Analytics
     * Access restricted strictly to Zonal Commissioners & Municipal Commissioner
     */
    @GetMapping("/zone/{zoneCode}")
    @PreAuthorize("hasAnyAuthority('ROLE_ZONAL_COMMISSIONER', 'ROLE_MUNICIPAL_COMMISSIONER')")
    public ResponseEntity<Map<String, Object>> getZoneAnalytics(@PathVariable String zoneCode) {
        List<Grievance> grievances = grievanceService.getGrievancesByZoneCode(zoneCode);

        long total = grievances.size();
        long submitted = grievances.stream().filter(g -> g.getStatus() == GrievanceStatus.SUBMITTED).count();
        long inProgress = grievances.stream().filter(g -> g.getStatus() == GrievanceStatus.IN_PROGRESS).count();
        long resolved = grievances.stream().filter(g -> g.getStatus() == GrievanceStatus.RESOLVED).count();
        long rejected = grievances.stream().filter(g -> g.getStatus() == GrievanceStatus.REJECTED).count();

        int resolutionRate = total > 0 ? (int) Math.round((double) resolved / total * 100) : 100;

        Map<String, Object> response = new HashMap<>();
        response.put("zoneCode", zoneCode.toUpperCase());
        response.put("totalGrievances", total);
        response.put("openCount", submitted + inProgress);
        response.put("submittedCount", submitted);
        response.put("inProgressCount", inProgress);
        response.put("resolvedCount", resolved);
        response.put("rejectedCount", rejected);
        response.put("resolutionRate", resolutionRate);

        return ResponseEntity.ok(response);
    }
}
