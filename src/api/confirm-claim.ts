import axios from "axios";
import { Address, ApiResult, ProjectId } from "../types/types";

export const confirmClaim = async (address: Address): ApiResult<void> => {
    try {
        return await axios.put(
            process.env.SERVER + `/claim/confirm/${address}`,
        );
    } catch (error) {
        console.log(error);
    }

    return;
};