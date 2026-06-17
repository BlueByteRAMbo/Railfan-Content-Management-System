package com.railfan.archive.dto.response;

import com.railfan.archive.enums.EncounterType;

public class TrainEncounterResponse {
    private Long id;
    private EncounterType encounterType;
    private String trainNumber;
    private String trainName;
    private NamedReference trainCategory;
    private String locoNumber;
    private NamedReference locoType;
    private NamedReference locoShed;

    public TrainEncounterResponse() {}

    public TrainEncounterResponse(Long id, EncounterType encounterType, String trainNumber, String trainName, NamedReference trainCategory, String locoNumber, NamedReference locoType, NamedReference locoShed) {
        this.id = id;
        this.encounterType = encounterType;
        this.trainNumber = trainNumber;
        this.trainName = trainName;
        this.trainCategory = trainCategory;
        this.locoNumber = locoNumber;
        this.locoType = locoType;
        this.locoShed = locoShed;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EncounterType getEncounterType() { return encounterType; }
    public void setEncounterType(EncounterType encounterType) { this.encounterType = encounterType; }

    public String getTrainNumber() { return trainNumber; }
    public void setTrainNumber(String trainNumber) { this.trainNumber = trainNumber; }

    public String getTrainName() { return trainName; }
    public void setTrainName(String trainName) { this.trainName = trainName; }

    public NamedReference getTrainCategory() { return trainCategory; }
    public void setTrainCategory(NamedReference trainCategory) { this.trainCategory = trainCategory; }

    public String getLocoNumber() { return locoNumber; }
    public void setLocoNumber(String locoNumber) { this.locoNumber = locoNumber; }

    public NamedReference getLocoType() { return locoType; }
    public void setLocoType(NamedReference locoType) { this.locoType = locoType; }

    public NamedReference getLocoShed() { return locoShed; }
    public void setLocoShed(NamedReference locoShed) { this.locoShed = locoShed; }

    public static TrainEncounterResponseBuilder builder() {
        return new TrainEncounterResponseBuilder();
    }

    public static class TrainEncounterResponseBuilder {
        private Long id;
        private EncounterType encounterType;
        private String trainNumber;
        private String trainName;
        private NamedReference trainCategory;
        private String locoNumber;
        private NamedReference locoType;
        private NamedReference locoShed;

        TrainEncounterResponseBuilder() {}

        public TrainEncounterResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TrainEncounterResponseBuilder encounterType(EncounterType encounterType) {
            this.encounterType = encounterType;
            return this;
        }

        public TrainEncounterResponseBuilder trainNumber(String trainNumber) {
            this.trainNumber = trainNumber;
            return this;
        }

        public TrainEncounterResponseBuilder trainName(String trainName) {
            this.trainName = trainName;
            return this;
        }

        public TrainEncounterResponseBuilder trainCategory(NamedReference trainCategory) {
            this.trainCategory = trainCategory;
            return this;
        }

        public TrainEncounterResponseBuilder locoNumber(String locoNumber) {
            this.locoNumber = locoNumber;
            return this;
        }

        public TrainEncounterResponseBuilder locoType(NamedReference locoType) {
            this.locoType = locoType;
            return this;
        }

        public TrainEncounterResponseBuilder locoShed(NamedReference locoShed) {
            this.locoShed = locoShed;
            return this;
        }

        public TrainEncounterResponse build() {
            return new TrainEncounterResponse(id, encounterType, trainNumber, trainName, trainCategory, locoNumber, locoType, locoShed);
        }
    }
}
