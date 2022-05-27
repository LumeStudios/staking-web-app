import axios from "axios";
import { Address, ApiResult, ProjectId } from "../types/types";

export const cancelClaim = async (): ApiResult<void> => {
    try {
        return await axios.put(
            process.env.SERVER + `/claim/reject/`,
        );
    } catch (error) {
        console.log(error);
    }

    return;
};