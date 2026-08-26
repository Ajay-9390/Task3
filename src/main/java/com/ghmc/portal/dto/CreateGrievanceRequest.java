package com.ghmc.portal.dto;

public class CreateGrievanceRequest {
    private String title;
    private String category;
    private String description;
    private String location;
    private String wardNo;
    private String zoneCode;

    public CreateGrievanceRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWardNo() { return wardNo; }
    public void setWardNo(String wardNo) { this.wardNo = wardNo; }

    public String getZoneCode() { return zoneCode; }
    public void setZoneCode(String zoneCode) { this.zoneCode = zoneCode; }
}
