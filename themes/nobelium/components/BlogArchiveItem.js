import BlogPost from './BlogPost'

export default function BlogArchiveItem({ archiveTitle, archivePosts }) {
  return (
    <section className='reading-archive-group'>
      <h2>{archiveTitle}</h2>
      {archivePosts[archiveTitle].map(post => (
        <BlogPost key={post.id} post={post} />
      ))}
    </section>
  )
}
