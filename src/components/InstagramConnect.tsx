import React from 'react'
import { Button } from '@/components/ui/button'

export default function InstagramConnect() {
  const clientId = import.meta.env.VITE_IG_APP_ID
  const redirectUri = import.meta.env.VITE_IG_REDIRECT_URI
  const authorizeUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_content_publish&response_type=code`

  return (
    <div className="text-center">
      <Button as="a" href={authorizeUrl} className="mx-auto">
        Connect Instagram
      </Button>
    </div>
  )
}