import axios from "axios";
import { Address, ApiResult, ProjectId } from "../types/types";

export const confirmClaim = async (): ApiResult<void> => {
    try {
        return await axios.put(
            process.env.SERVER + `/claim/confirm/`,
        );
    } catch (error) {
        console.log(error);
    }

    return;
};