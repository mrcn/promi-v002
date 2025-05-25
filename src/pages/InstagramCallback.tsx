import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'

export default function InstagramCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const code = params.get('code')

  useEffect(() => {
    if (!code) {
      toast({ title: 'Instagram connect failed', variant: 'destructive' })
      navigate('/dashboard')
      return
    }
    ;(async () => {
      const { data, error } = await supabase.functions.invoke('instagram-exchange', { body: { code } })
      if (error || (data as any).error) {
        toast({ title: 'Error connecting Instagram', description: (data as any).error || error?.message, variant: 'destructive' })
      } else {
        toast({ title: 'Instagram connected!', variant: 'success' })
      }
      navigate('/dashboard')
    })()
  }, [code])

  return <div>Connecting...</div>
}