package com.ghmc.portal.model;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "zones")
public class Zone implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. KHAIRATABAD, SECUNDERABAD

    @Column(nullable = false)
    private String name; // e.g. Khairatabad Zone

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String status = "ACTIVE";

    public Zone() {}

    public Zone(String id, String code, String name, String district, String status) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.district = district;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Zone zone = (Zone) o;
        return Objects.equals(id, zone.id) && Objects.equals(code, zone.code);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, code);
    }
}
