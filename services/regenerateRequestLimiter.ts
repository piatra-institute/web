import {
    REGENERATE_REQUEST_LIMIT,
} from '@/data';



class RegenerateRequestLimiter {
    requestsLastDay: number = 0;

    constructor() {
        setInterval(() => {
            this.requestsLastDay = 0;
        }, 1_000 * 60 * 60 * 24);
    }

    public increase() {
        if (this.requestsLastDay < REGENERATE_REQUEST_LIMIT) {
            this.requestsLastDay += 1;
            return true;
        }

        return false;
    }
}


const regenerateRequestLimiter = new RegenerateRequestLimiter();


export default regenerateRequestLimiter;
