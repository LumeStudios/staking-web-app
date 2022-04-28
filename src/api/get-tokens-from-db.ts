import axios from "axios";
import { ApiResult, Tokens, TokensFromDb } from "../types/types";

export const getTokensFromDb = async (tokensId: Tokens): ApiResult<Array<TokensFromDb>> => {
    try {
        return await axios.post(
            process.env.SERVER_SEAMORE + '/assets/get-infos',
            { tokensId }
        );
    } catch (error) {
        console.log(error);
    }

    return;
};