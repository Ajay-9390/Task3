package com.ghmc.portal.model;

public enum Role {
    ROLE_MUNICIPAL_COMMISSIONER, // Super admin access across all GHMC zones
    ROLE_ZONAL_COMMISSIONER,     // Zone owner access
    ROLE_WARD_INSPECTOR,         // Field officer & status updater
    ROLE_CITIZEN                 // Citizen filing complaints & paying tax
}
