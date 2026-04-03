import React from 'react'

import { textFieldClassName } from '../styles/form'

type ReviewEditRowProps = {
  title: string
  content: string
  rating: number
  tags: string
  onTitleChange: (value: string) => void
  onContentChange: (value: string) => void
  onRatingChange: (value: number) => void
  onTagsChange: (value: string) => void
}

export const ReviewEditRow: React.FC<ReviewEditRowProps> = ({
  title,
  content,
  rating,
  tags,
  onTitleChange,
  onContentChange,
  onRatingChange,
  onTagsChange
}) => {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        className={textFieldClassName}
        placeholder="Titre"
      />
      <textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        rows={4}
        className={textFieldClassName}
        placeholder="Contenu"
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          title="Note"
          type="number"
          min={0}
          max={10}
          value={rating}
          onChange={(event) => onRatingChange(Number(event.target.value))}
          className={textFieldClassName}
        />
        <input
          type="text"
          value={tags}
          onChange={(event) => onTagsChange(event.target.value)}
          className={textFieldClassName}
          placeholder="Tags (comma separated)"
        />
      </div>
    </div>
  )
}
