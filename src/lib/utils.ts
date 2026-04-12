import { Subject } from '@/lib/types';

export function calculateProgress(syllabus: Subject[]) {
    let totalItems = 0;
    let completedScore = 0;

    syllabus.forEach((subject) => {
        subject.topics.forEach((topic) => {
            topic.subtopics.forEach((sub) => {
                totalItems += 1;
                // Weighted scoring
                if (sub.state === 'revised') completedScore += 1;
                else if (sub.state === 'practiced') completedScore += 0.75;
                else if (sub.state === 'read') completedScore += 0.4;
            });
        });
    });

    const percentage = totalItems === 0 ? 0 : Math.round((completedScore / totalItems) * 100);

    return {
        total: totalItems,
        completed: Math.round(completedScore),
        percentage,
    };
}
