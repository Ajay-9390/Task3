package com.ghmc.portal.dto;

import com.ghmc.portal.model.GrievanceStatus;

public class UpdateGrievanceStatusRequest {
    private GrievanceStatus status;

    public UpdateGrievanceStatusRequest() {}

    public GrievanceStatus getStatus() { return status; }
    public void setStatus(GrievanceStatus status) { this.status = status; }
}
