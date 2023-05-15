import { Controller } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { SkipThrottle } from "@nestjs/throttler";

@Controller("reviews")
@SkipThrottle()
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) {}
}
