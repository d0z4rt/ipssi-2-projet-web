import { AppDataSource } from '#config/typeorm-datasource.js'
import { ApiError } from '#utils/errors.js'
import { In } from 'typeorm'

import type {
  CreateReviewSchema,
  UpdateReviewSchema
} from './review.schemas.js'

import { Like } from './like.entity.js'
import { Review } from './review.entity.js'
import { ReviewToTag } from './reviewToTag.entity.js'
import { Tag } from './tag.entity.js'

const reviewRepository = AppDataSource.getRepository(Review)
const likeRepository = AppDataSource.getRepository(Like)
const tagRepository = AppDataSource.getRepository(Tag)

const reviewService = {
  create: async (user_id: string, data: CreateReviewSchema) => {
    // Start a transaction to ensure data consistency
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      // Create the review without tags first
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
    })
  },

  getAll: async () => {
    return reviewRepository.find({
      order: { created_at: 'DESC' },
      relations: {
        reviews_to_tags: {
          tag: true
        },
        likes: true
      }
    })
  },

  getOne: async (id: string) => {
    return reviewRepository.findOne({
      where: { id },
      relations: {
        reviews_to_tags: {
          tag: true
        },
        likes: true
      }
    })
  },

  getReviewsByTags: async (tagNames: string[]) => {
    const tags = await tagRepository.find({ where: { name: In(tagNames) } })
    const tagIds = tags.map((tag) => tag.id)

    return reviewRepository
      .createQueryBuilder('review')
      .innerJoin('review.reviews_to_tags', 'reviewToTag')
      .where('reviewToTag.tag_id IN (:...tagIds)', { tagIds })
      .groupBy('review.id')
      .having('COUNT(DISTINCT reviewToTag.tag_id) = :tagCount', {
        tagCount: tagIds.length
      })
      .getMany()
  },

  update: async (id: string, data: UpdateReviewSchema) => {
    const review = await reviewRepository.findOne({ where: { id } })
    if (!review) {
      throw new ApiError(404, 'Review not found')
    }

    // tags handling
    const tags = data.tags
    if (tags) {
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        const tagRepo = transactionalEntityManager.getRepository(Tag)

        // Delete old tags
        await transactionalEntityManager.delete(ReviewToTag, { review_id: id })

        // Create new tags if they don't exist
        await tagRepo
          .createQueryBuilder()
          .insert()
          .into(Tag)
          .values(tags.map((name) => ({ name })))
          .orIgnore()
          .execute()

        // Get all tags and link them
        const found_tags = await tagRepo.find({ where: { name: In(tags) } })
        const reviewToTags = found_tags.map((tag) =>
          transactionalEntityManager.create(ReviewToTag, {
            review_id: id,
            tag_id: tag.id
          })
        )
        await transactionalEntityManager.save(ReviewToTag, reviewToTags)
      })
    }

    const { tags: _, ...updateData } = data

    if (Object.keys(updateData).length > 0) {
      await reviewRepository.update(id, updateData)
    }

    return reviewService.getOne(id)
  },

  delete: async (id: string) => {
    const review = await reviewRepository.findOne({ where: { id } })
    if (!review) {
      throw new ApiError(404, 'Review not found')
    }
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
