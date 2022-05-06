import axios from "axios";
import { Address, ApiResult, ProjectId } from "../types/types";

export const cancelClaim = async (address: Address): ApiResult<void> => {
    try {
        return await axios.delete(
            process.env.SERVER + `/claim/reject/${address}`,
        );
    } catch (error) {
        console.log(error);
    }

    return;
};