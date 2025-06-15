// types/thesis.ts
export interface PromoterInfo {
    id: number;
    name: string;
    surname: string;
    expertiseField: string;
}

export interface ThesisTopicResponse {
    id: number;
    title: string;
    description: string;
    degreeLevel: string;
    availableSlots: number;
    tags: string[];
    promoter: PromoterInfo;
}

export const mockTopics: ThesisTopicResponse[] = [
    {
        id: 1,
        title: "Machine Learning in Cybersecurity",
        description: "Research and implement ML algorithms for detecting cyber threats",
        degreeLevel: "MASTER",
        availableSlots: 3,
        tags: ["machine learning", "cybersecurity", "AI"],
        promoter: {
            id: 101,
            name: "John",
            surname: "Doe",
            expertiseField: "Artificial Intelligence"
        }
    },
    {
        id: 2,
        title: "Blockchain for Supply Chain Management",
        description: "Explore blockchain applications in supply chain transparency",
        degreeLevel: "BACHELOR",
        availableSlots: 2,
        tags: ["blockchain", "supply chain", "distributed systems"],
        promoter: {
            id: 102,
            name: "Alice",
            surname: "Smith",
            expertiseField: "Distributed Systems"
        }
    },
    {
        id: 3,
        title: "Quantum Computing Algorithms",
        description: "Study and implement basic quantum computing algorithms",
        degreeLevel: "MASTER",
        availableSlots: 1,
        tags: ["quantum computing", "algorithms"],
        promoter: {
            id: 103,
            name: "Robert",
            surname: "Johnson",
            expertiseField: "Quantum Computing"
        }
    }
];


export const mockApplications = [
    {
        id: 1,
        topicId: 1,
        topicTitle: "Artificial Intelligence in Healthcare",
        description: "I'm interested in exploring AI applications in healthcare.",
        status: 2, // rejected
        promoterName: "John",
        promoterSurname: "Doe"
    },
    {
        id: 2,
        topicId: 2,
        topicTitle: "Blockchain Technology Applications",
        description: "I want to research blockchain applications in finance.",
        status: 1, // accepted
        promoterName: "Jane",
        promoterSurname: "Smith"
    },
    {
        id: 2,
        topicId: 2,
        topicTitle: "Butchery Skills in modern world",
        description: "Hello I'm John Pork and i want to be butcher.",
        status: 3, // withdrawn
        promoterName: "John",
        promoterSurname: "Pork"
    },
];