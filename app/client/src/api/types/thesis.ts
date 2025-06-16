import { PromoterInfo } from "./supervisor";

export interface ThesisTopic {
    id: number
    title: string
    description: string
    degreeLevel: string
    availableSlots: number
    tags: string[]
    promoter: PromoterInfo
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

