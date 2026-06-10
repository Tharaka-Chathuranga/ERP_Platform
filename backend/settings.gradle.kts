rootProject.name = "erp-platform"

// ── Modular monolith ──────────────────────────────────────────────
// Each business capability is its own Gradle module. Modules depend on
// shared only; they never depend on each other directly. The
// bootstrap module assembles them into a single deployable application.
include(
    ":shared",
    ":iam",
    ":store",
    ":bootstrap",
)
