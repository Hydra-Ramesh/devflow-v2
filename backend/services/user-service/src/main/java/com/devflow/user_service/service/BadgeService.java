package com.devflow.user_service.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.devflow.user_service.dto.BadgeDTO;

@Service
public class BadgeService {

    public List<BadgeDTO> calculateBadges(Integer reputation, Long questionCount, Long answerCount) {
        List<BadgeDTO> badges = new ArrayList<>();
        int rep = reputation != null ? reputation : 0;
        long qCount = questionCount != null ? questionCount : 0;
        long aCount = answerCount != null ? answerCount : 0;

        if (rep >= 1000) {
            badges.add(new BadgeDTO("Established", "🏆", "Earned 1,000 reputation"));
        } else if (rep >= 100) {
            badges.add(new BadgeDTO("Rising Star", "🌟", "Earned 100 reputation"));
        }

        if (qCount >= 5) {
            badges.add(new BadgeDTO("Curious", "🤔", "Asked 5 or more questions"));
        }

        if (aCount >= 10) {
            badges.add(new BadgeDTO("Helpful", "🤝", "Provided 10 or more answers"));
        }

        if (badges.isEmpty()) {
            badges.add(new BadgeDTO("Newcomer", "👋", "Joined the DevFlow community"));
        }

        return badges;
    }
}