import axios from "axios";
import { Address, ApiResult, ProjectId } from "../types/types";

export const createClaim = async (address: Address, storyReward: number, currentBalance: number): ApiResult<{ id: number, address: string, signature: { v: string, r: string, s: string } }> => {
    try {
        return await axios.post(
            process.env.SERVER + '/claim/',
            { address, storyReward, currentBalance },
        );
    } catch (error) {
        console.log(error);
    }

    return;
};