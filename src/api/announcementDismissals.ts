import axios from './axios.js'

export async function fetchDismissedAnnouncementsRequest() {
  const response = await axios.get('/users/me/dismissed-announcements')
  const ids = response.data?.ids
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
}

export async function dismissAnnouncementOnServerRequest(announcementIds: string[]) {
  const uniqueIds = [...new Set(announcementIds.filter((id) => typeof id === 'string' && id.trim()))]
  if (uniqueIds.length === 0) return []

  const response = await axios.post('/users/me/dismissed-announcements', {
    announcementIds: uniqueIds,
  })
  const ids = response.data?.ids
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : uniqueIds
}
