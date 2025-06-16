import { studentInfo } from "./student";
import { PromoterInfo } from "./supervisor";

export interface ApplyTopicRequest {
    topicId: number
    description: string
}

export interface ApplicationsResponse {
    id: number;
    topicId: number;
    topicTitle: string; 
    description: string; 
    status: number; 
    student: studentInfo;
    promoter: PromoterInfo;
}