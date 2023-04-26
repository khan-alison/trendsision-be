import { ReviewsService } from "./reviews.service";
import { Controller } from "@nestjs/common";

@Controller("reviews")
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) {}
}
