import {
    NextApiRequest,
    NextApiResponse,
} from 'next';

import regenerate from '@/logic/regenerate';



export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse,
) {
    if (request.method !== 'POST') {
        response.status(400).json({
            status: false,
        });
        return;
    }

    try {
        const {
            concern,
        } = request.body;

        const result = await regenerate(concern);
        if (!result) {
            response.status(400).json({
                status: false,
            });
            return;
        }

        response.json({
            status: true,
            data: result,
        });
    } catch (error) {
        response.status(400).json({
            status: false,
        });
    }
}
