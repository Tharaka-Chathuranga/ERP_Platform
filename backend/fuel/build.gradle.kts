// fuel ── fuel & vehicle management. Tracks the two diesel tanks (timed
// readings for the internal tank, vehicle issues for the vehicle tank),
// refills and a dated fuel-price history. Depends only on the shared module.

dependencies {
    implementation(project(":shared"))
}
