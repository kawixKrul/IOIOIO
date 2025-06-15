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

export interface ApplicationsResponse {
    id: number;
    topicId: number;
    topicTitle: string; 
    description: string; 
    status: number; 
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
    },
    {
        id: 4,
        title: "Natural Language Processing for Healthcare",
        description: "Develop NLP tools to improve patient care and medical records processing",
        degreeLevel: "MASTER",
        availableSlots: 2,
        tags: ["NLP", "healthcare", "AI"],
        promoter: {
            id: 101, // John Doe again
            name: "John",
            surname: "Doe",
            expertiseField: "Artificial Intelligence"
        }
    },
    {
        id: 5,
        title: "Augmented Reality in Education",
        description: "Innovate teaching methods using AR technologies to enhance learning experience",
        degreeLevel: "MASTER",
        availableSlots: 3,
        tags: ["augmented reality", "education", "technology"],
        promoter: {
            id: 104,
            name: "Emily",
            surname: "White",
            expertiseField: "Human-Computer Interaction"
        }
    },
    {
        id: 6,
        title: "Sustainability in IT Operations",
        description: "Research methods to increase energy efficiency in data centers",
        degreeLevel: "BACHELOR",
        availableSlots: 1,
        tags: ["sustainability", "IT operations", "energy efficiency"],
        promoter: {
            id: 105,
            name: "Michael",
            surname: "Brown",
            expertiseField: "Sustainable Technologies"
        }
    },
    {
        id: 7,
        title: "Internet of Things Security",
        description: "Enhance security protocols for IoT devices across various networks",
        degreeLevel: "MASTER",
        availableSlots: 2,
        tags: ["IoT", "security", "networks"],
        promoter: {
            id: 102, // Alice Smith again
            name: "Alice",
            surname: "Smith",
            expertiseField: "Distributed Systems"
        }
    },
    {
        id: 8,
        title: "Deep Learning for Autonomous Vehicles",
        description: "Develop deep learning models to improve self-driving car performance",
        degreeLevel: "MASTER",
        availableSlots: 2,
        tags: ["deep learning", "autonomous vehicles", "AI"],
        promoter: {
            id: 106,
            name: "Lisa",
            surname: "Green",
            expertiseField: "Artificial Intelligence"
        }
    }
];


export const mockApplications: ApplicationsResponse[] = [
    {
        id: 1,
        topicId: 1,
        topicTitle: "Machine Learning in Cybersecurity",
        description: "I'm interested in exploring AI applications in healthcare.",
        status: 0, // Rejected
        promoter: mockTopics.find(topic => topic.id === 1)?.promoter as PromoterInfo
    },
    {
        id: 2,
        topicId: 2,
        topicTitle: "Blockchain for Supply Chain Management",
        description: "I want to research blockchain applications in finance.",
        status: 1, // Accepted
        promoter: mockTopics.find(topic => topic.id === 2)?.promoter as PromoterInfo
    },
    {
        id: 3,
        topicId: 3,
        topicTitle: "Quantum Computing Algorithms",
        description: "Hello, I'm interested in quantum computing for algorithm development.",
        status: 3, // Withdrawn
        promoter: mockTopics.find(topic => topic.id === 3)?.promoter as PromoterInfo
    }
];