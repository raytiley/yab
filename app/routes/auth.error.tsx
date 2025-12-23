import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Link, useSearchParams } from 'react-router'

export default function Page() {
  const [searchParams] = useSearchParams()
  const error = searchParams?.get('error') || 'An unspecified error occurred.'
  const isExpiredLink = error.toLowerCase().includes('expired')

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {isExpiredLink ? 'Link Expired' : 'Something went wrong'}
              </CardTitle>
              <CardDescription>
                {isExpiredLink
                  ? 'This password reset link has expired. Please request a new one.'
                  : error}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isExpiredLink && (
                <Button asChild>
                  <Link to="/forgot-password">Request new reset link</Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/login">Back to login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
