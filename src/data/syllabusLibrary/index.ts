// Auto-generated summary of all available exams
export interface ExamSummary {
    id: string; // Used to lazily load the JSON file
    targetExam: {
        name: string;
        date: string;
    };
    totalSubjects: number;
    totalTopics: number;
}

export const availableExams: ExamSummary[] = [
    {
        "id": "up_police_si",
        "targetExam": {
            "name": "UP Police SI",
            "date": "2026-03-31T00:00:00.000Z"
        },
        "totalSubjects": 5,
        "totalTopics": 10
    },
    {
        "id": "ssc_cgl_2026_tier_1_2",
        "targetExam": {
            "name": "SSC CGL 2026 (Tier 1 & 2)",
            "date": "2026-09-01T00:00:00.000Z"
        },
        "totalSubjects": 4,
        "totalTopics": 8
    },
    {
        "id": "rrb_ntpc_2026_cbt_1",
        "targetExam": {
            "name": "RRB NTPC 2026 (CBT 1)",
            "date": "2026-08-15T00:00:00.000Z"
        },
        "totalSubjects": 2,
        "totalTopics": 3
    },
    {
        "id": "upsc_cse_prelims_2026",
        "targetExam": {
            "name": "UPSC CSE Prelims 2026",
            "date": "2026-05-31T00:00:00.000Z"
        },
        "totalSubjects": 2,
        "totalTopics": 6
    },
    {
        "id": "upsssc_lekhpal_2026",
        "targetExam": {
            "name": "UPSSSC Lekhpal 2026",
            "date": "2026-05-21T00:00:00.000Z"
        },
        "totalSubjects": 3,
        "totalTopics": 8
    },
    {
        "id": "jee_main_2026",
        "targetExam": {
            "name": "JEE Main 2026",
            "date": "2026-01-24T00:00:00.000Z"
        },
        "totalSubjects": 3,
        "totalTopics": 6
    }
];
