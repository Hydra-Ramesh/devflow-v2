package com.devflow.user_service.metrics;

import org.springframework.stereotype.Component;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

@Component
public class UserMetrics {

    private final Counter registeredUsersCounter;
    private final Counter profileViewsCounter;
    private final Counter reputationUpdatesCounter;
    private final Counter bookmarksToggledCounter;

    public UserMetrics(MeterRegistry registry) {
        this.registeredUsersCounter = Counter.builder("devflow.users.registered.total")
                .description("Total number of registered users processed by User Service")
                .register(registry);

        this.profileViewsCounter = Counter.builder("devflow.users.profile.views.total")
                .description("Total number of profile view requests")
                .register(registry);

        this.reputationUpdatesCounter = Counter.builder("devflow.users.reputation.updates.total")
                .description("Total number of reputation adjustment events")
                .register(registry);

        this.bookmarksToggledCounter = Counter.builder("devflow.users.bookmarks.toggled.total")
                .description("Total number of bookmark add/remove operations")
                .register(registry);
    }

    public void incrementRegisteredUsers() {
        registeredUsersCounter.increment();
    }

    public void incrementProfileViews() {
        profileViewsCounter.increment();
    }

    public void incrementReputationUpdates() {
        reputationUpdatesCounter.increment();
    }

    public void incrementBookmarksToggled() {
        bookmarksToggledCounter.increment();
    }
}
