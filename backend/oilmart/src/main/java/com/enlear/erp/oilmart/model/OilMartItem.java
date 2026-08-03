package com.enlear.erp.oilmart.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oil_mart_items", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartItem extends BaseEntity {

    public static final String DEFAULT_UNIT_OF_MEASURE = "L";

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "oil_type", nullable = false, length = 24)
    private OilType oilType;

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String grade;

    @Column(length = 1000)
    private String description;

    @Column(name = "unit_of_measure", nullable = false, length = 16)
    private String unitOfMeasure = DEFAULT_UNIT_OF_MEASURE;

    @Column(name = "reorder_level_litres", nullable = false, precision = 19, scale = 4)
    private BigDecimal reorderLevelLitres = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private OilMartItemStatus status = OilMartItemStatus.ACTIVE;

    public OilMartItem(String code, String name, OilType oilType, String brand, String grade,
                       String description, String unitOfMeasure, BigDecimal reorderLevelLitres,
                       OilMartItemStatus status) {
        apply(code, name, oilType, brand, grade, description, unitOfMeasure, reorderLevelLitres,
                status);
    }

    public void update(String code, String name, OilType oilType, String brand, String grade,
                       String description, String unitOfMeasure, BigDecimal reorderLevelLitres,
                       OilMartItemStatus status) {
        apply(code, name, oilType, brand, grade, description, unitOfMeasure, reorderLevelLitres,
                status);
    }

    private void apply(String code, String name, OilType oilType, String brand, String grade,
                       String description, String unitOfMeasure, BigDecimal reorderLevelLitres,
                       OilMartItemStatus status) {
        this.code = code;
        this.name = name;
        this.oilType = oilType;
        this.brand = brand;
        this.grade = grade;
        this.description = description;
        this.unitOfMeasure = unitOfMeasure != null && !unitOfMeasure.isBlank()
                ? unitOfMeasure.trim()
                : DEFAULT_UNIT_OF_MEASURE;
        this.reorderLevelLitres = reorderLevelLitres != null ? reorderLevelLitres : BigDecimal.ZERO;
        this.status = status != null ? status : OilMartItemStatus.ACTIVE;
    }

    public boolean isActive() {
        return status == OilMartItemStatus.ACTIVE;
    }
}
