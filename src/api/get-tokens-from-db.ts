import axios from "axios";
import { ApiResult, Tokens, TokensFromDb } from "../types/types";

export const getTokensFromDb = async (tokensId: Tokens): ApiResult<Array<TokensFromDb>> => {
    try {
        const response = await axios.post(
            process.env.SERVER_SEAMORE + '/assets/get-infos',
            { tokensId }
        );
        return response;
    } catch (error) {
        console.log(error);
    }

    return;
};