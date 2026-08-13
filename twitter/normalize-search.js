export default function normalizeSearch (payload, limit = 3) {
  const users = new Map(
    (payload?.includes?.users ?? []).map(user => [user.id, user])
  )
  const data = Array.isArray(payload?.data) ? payload.data : []

  return {
    statuses: data.slice(0, limit).map(post => {
      const user = users.get(post.author_id)
      const metrics = post.public_metrics ?? {}

      return {
        text: post.text ?? '',
        user: {
          name: user?.name ?? 'Unknown',
          screen_name: user?.username ?? 'unknown'
        },
        reply_count: metrics.reply_count ?? 0,
        retweet_count: metrics.retweet_count ?? 0,
        favorite_count: metrics.like_count ?? 0
      }
    })
  }
}
