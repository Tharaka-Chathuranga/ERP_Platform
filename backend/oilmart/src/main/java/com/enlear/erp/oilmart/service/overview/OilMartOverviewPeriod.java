package com.enlear.erp.oilmart.service.overview;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;

/** How far back the overview looks, and therefore how the trend is bucketed. */
public enum OilMartOverviewPeriod {

    TODAY(ChronoUnit.HOURS),
    THIS_WEEK(ChronoUnit.DAYS),
    THIS_MONTH(ChronoUnit.DAYS);

    private final ChronoUnit bucket;

    OilMartOverviewPeriod(ChronoUnit bucket) {
        this.bucket = bucket;
    }

    public ChronoUnit bucket() {
        return bucket;
    }

    /** First day covered by this period, inclusive. */
    public LocalDate startOn(LocalDate today) {
        return switch (this) {
            case TODAY -> today;
            case THIS_WEEK -> today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case THIS_MONTH -> today.withDayOfMonth(1);
        };
    }

    /**
     * Day after the last one covered. The trend runs to the end of the period
     * rather than to today, so a part-finished week still shows all seven days.
     */
    public LocalDate endOn(LocalDate today) {
        return switch (this) {
            case TODAY -> today.plusDays(1);
            case THIS_WEEK -> startOn(today).plusWeeks(1);
            case THIS_MONTH -> today.withDayOfMonth(1).plusMonths(1);
        };
    }
}
