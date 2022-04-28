import axios from "axios";
import { Address, ApiResult, ProjectId, Tokens } from "../types/types";

export const getChapterReward = async (address: Address): ApiResult<{ address: Address, storyRewards: number }> => {
    try {
        return await axios.get(
            process.env.SERVER + `/users/story/get-reward/${address}`,
        );
    } catch (error) {
        console.log(error);
    }
    return;
};