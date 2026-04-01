import { AppDataSource } from '#config/typeorm-datasource.js'
import { In } from 'typeorm'

import type { CreateReviewSchema } from './review.schemas.js'

import { Like } from './like.entity.js'
import { Review } from './review.entity.js'
import { ReviewToTag } from './reviewToTag.entity.js'
import { Tag } from './tag.entity.js'

const reviewRepository = AppDataSource.getRepository(Review)
const likeRepository = AppDataSource.getRepository(Like)

const reviewService = {
  create: async (user_id: string, data: CreateReviewSchema) => {
    // Start a transaction to ensure data consistency
    return await AppDataSource.transaction(
      async (transactionalEntityManager) => {
        // 1. Create the review without tags first
        const { tags: tagNames, ...reviewData } = data
        const review = transactionalEntityManager.create(Review, {
          ...reviewData,
          user_id
        })

        const savedReview = await transactionalEntityManager.save(review)

        // Handle tags if provided
        if (tagNames && tagNames.length > 0) {
          // Find existing tags in one query
          const tagRepository = transactionalEntityManager.getRepository(Tag)

          // Upsert tags: insert or skip if already exists
          await tagRepository
            .createQueryBuilder()
            .insert()
            .into(Tag)
            .values(tagNames.map((name) => ({ name })))
            .orIgnore()
            .execute()

          // Get all tags (existing + newly created)
          const tags = await tagRepository.find({
            where: {
              name: In(tagNames)
            }
          })

          // Link tags to review
          const reviewToTags = tags.map((tag) =>
            transactionalEntityManager.create(ReviewToTag, {
              review_id: review.id,
              tag_id: tag.id
            })
          )

          await transactionalEntityManager.save(ReviewToTag, reviewToTags)

          // Attach tags to review object
          savedReview.reviews_to_tags = reviewToTags.map((rtt, idx) => ({
            ...rtt,
            tag: tags[idx]
          }))
        }

        return savedReview
      }
    )
  },

  getAll: async () => {
    return reviewRepository.find({
      order: { created_at: 'DESC' }
    })
  },

  getOne: async (id: string) => {
    return reviewRepository.findOne({ where: { id } })
  },

  update: async (id: string, data: Partial<Review>) => {
    // Update entity without CASCADES or relations
    await reviewRepository.update(id, data)
    return reviewRepository.findOneBy({ id })
  },

  delete: async (id: string) => {
    return reviewRepository.delete({ id })
  },

  addLike: async (review_id: string, user_id: string) => {
    const like = likeRepository.create({ review_id, user_id })
    return likeRepository.save(like)
  },

  removeLike: async (review_id: string, user_id: string) => {
    return likeRepository.delete({ review_id, user_id })
  }
}

export default reviewService
