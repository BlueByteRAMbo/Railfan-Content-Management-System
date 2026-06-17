package com.railfan.archive.dto.response;

import com.railfan.archive.enums.SecondaryLocoRole;

public class SecondaryLocoResponse {
    private Long id;
    private String locoNumber;
    private NamedReference locoType;
    private NamedReference locoShed;
    private SecondaryLocoRole role;

    public SecondaryLocoResponse() {
    }

    public SecondaryLocoResponse(Long id, String locoNumber, NamedReference locoType, NamedReference locoShed,
            SecondaryLocoRole role) {
        this.id = id;
        this.locoNumber = locoNumber;
        this.locoType = locoType;
        this.locoShed = locoShed;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLocoNumber() {
        return locoNumber;
    }

    public void setLocoNumber(String locoNumber) {
        this.locoNumber = locoNumber;
    }

    public NamedReference getLocoType() {
        return locoType;
    }

    public void setLocoType(NamedReference locoType) {
        this.locoType = locoType;
    }

    public NamedReference getLocoShed() {
        return locoShed;
    }

    public void setLocoShed(NamedReference locoShed) {
        this.locoShed = locoShed;
    }

    public SecondaryLocoRole getRole() {
        return role;
    }

    public void setRole(SecondaryLocoRole role) {
        this.role = role;
    }

    public static SecondaryLocoResponseBuilder builder() {
        return new SecondaryLocoResponseBuilder();
    }

    public static class SecondaryLocoResponseBuilder {
        private Long id;
        private String locoNumber;
        private NamedReference locoType;
        private NamedReference locoShed;
        private SecondaryLocoRole role;

        SecondaryLocoResponseBuilder() {
        }

        public SecondaryLocoResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public SecondaryLocoResponseBuilder locoNumber(String locoNumber) {
            this.locoNumber = locoNumber;
            return this;
        }

        public SecondaryLocoResponseBuilder locoType(NamedReference locoType) {
            this.locoType = locoType;
            return this;
        }

        public SecondaryLocoResponseBuilder locoShed(NamedReference locoShed) {
            this.locoShed = locoShed;
            return this;
        }

        public SecondaryLocoResponseBuilder role(SecondaryLocoRole role) {
            this.role = role;
            return this;
        }

        public SecondaryLocoResponse build() {
            return new SecondaryLocoResponse(id, locoNumber, locoType, locoShed, role);
        }
    }
}

