'use client';

import {
  Stories,
  StoriesContent,
  Story,
  StoryAuthor,
  StoryAuthorImage,
  StoryAuthorName,
  StoryOverlay,
  StoryVideo,
} from '@/components/ui/stories-carousel';

const crisisStories = [
  {
    id: 1,
    author: 'Panic Attack',
    avatar: 'https://images.unsplash.com/photo-1474223960279-c596b5ac7c0c?w=40&h=40&fit=crop&crop=face',
    fallback: 'PA',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4#t=20',
  },
  {
    id: 2,
    author: 'Overwhelmed',
    avatar: 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=40&h=40&fit=crop&crop=face',
    fallback: 'OW',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4#t=20',
  },
  {
    id: 3,
    author: "Can't Breathe",
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=40&h=40&fit=crop&crop=face',
    fallback: 'CB',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 4,
    author: 'Heartbroken',
    avatar: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=40&h=40&fit=crop&crop=face',
    fallback: 'HB',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 5,
    author: '3am Anxiety',
    avatar: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=40&h=40&fit=crop&crop=face',
    fallback: '3A',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
];

export default function StoriesSection() {
  return (
    <Stories>
      <StoriesContent>
        {crisisStories.map((story) => (
          <Story className="aspect-[3/4] w-[200px]" key={story.id}>
            <StoryVideo src={story.video} />
            <StoryOverlay />
            <StoryAuthor>
              <StoryAuthorImage
                fallback={story.fallback}
                name={story.author}
                src={story.avatar}
              />
              <StoryAuthorName style={{ color: '#ffffff' }}>{story.author}</StoryAuthorName>
            </StoryAuthor>
          </Story>
        ))}
      </StoriesContent>
    </Stories>
  );
}
