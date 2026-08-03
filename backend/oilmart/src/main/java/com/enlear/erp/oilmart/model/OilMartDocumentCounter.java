package com.enlear.erp.oilmart.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oil_mart_document_counters", schema = "oilmart")
@IdClass(OilMartDocumentCounter.Key.class)
@Getter
@NoArgsConstructor
public class OilMartDocumentCounter {

    private static final int CENTURY = 100;

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 8)
    private OilMartDocumentType docType;

    @Id
    @Column(nullable = false)
    private Integer year;

    @Id
    @Column(nullable = false)
    private Integer month;

    @Column(name = "last_number", nullable = false)
    private Long lastNumber = 0L;

    public OilMartDocumentCounter(OilMartDocumentType docType, Integer year, Integer month) {
        this.docType = docType;
        this.year = year;
        this.month = month;
        this.lastNumber = 0L;
    }

    public String allocate() {
        this.lastNumber += 1;
        return "%s-%02d-%02d-%03d".formatted(docType.name(), year % CENTURY, month, lastNumber);
    }

    @Getter
    @NoArgsConstructor
    public static class Key implements Serializable {
        private OilMartDocumentType docType;
        private Integer year;
        private Integer month;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Key other)) return false;
            return docType == other.docType
                    && Objects.equals(year, other.year)
                    && Objects.equals(month, other.month);
        }

        @Override
        public int hashCode() {
            return Objects.hash(docType, year, month);
        }
    }
}
